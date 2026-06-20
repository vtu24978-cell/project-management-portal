const { Op } = require('sequelize');
const Task = require('../models/Task');

// @desc    Process chatbot natural language messages and run corresponding DB actions
// @route   POST /api/chatbot
// @access  Private
const handleBotMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ response: 'Please type a valid message.' });
    }

    const cleanMsg = message.trim();
    const cleanMsgLower = cleanMsg.toLowerCase();

    // 1. Help / Commands Intent
    if (['help', 'commands', 'menu', 'hi', 'hello'].includes(cleanMsgLower)) {
      return res.json({
        response: `Hello! I am your TaskFlow AI assistant. Here is what I can do:
        
🔹 **Create a task**: 
Type: \`create task: [Title] - [Description (min 20 chars)]\`
Example: \`create task: Setup Docker - Build a robust docker container for the Node.js API\`

🔹 **Complete a task**: 
Type: \`complete task: [ID or Title]\`
Example: \`complete task: Setup Docker\` or \`complete task: 4\`

🔹 **Delete a task**: 
Type: \`delete task: [ID or Title]\`
Example: \`delete task: 4\`

🔹 **List your tasks**: 
Type: \`list tasks\` or \`list pending tasks\` or \`list completed tasks\`

🔹 **Task summary**: 
Type: \`stats\` or \`summary\``,
        action: 'help',
        refresh: false
      });
    }

    // 2. Create Task Intent
    // Matches "create task: [Title] - [Description]" or "add task: [Title] - [Description]"
    const createRegex = /^(?:create|add)\s+task:?\s*(.+?)\s+-\s+(.+)$/i;
    const createMatch = cleanMsg.match(createRegex);
    if (createMatch) {
      const title = createMatch[1].trim();
      const description = createMatch[2].trim();

      if (description.length < 20) {
        return res.json({
          response: `⚠️ Task creation failed: The description must be at least 20 characters long. Your description was only ${description.length} characters.`,
          action: 'error',
          refresh: false
        });
      }

      const newTask = await Task.create({
        title,
        description,
        status: 'Pending',
        userId
      });

      return res.json({
        response: `✅ Task successfully created!
        
📌 **Title**: ${newTask.title}
📝 **Description**: ${newTask.description}
⚡ **Status**: Pending (ID: ${newTask.id})`,
        action: 'create',
        refresh: true
      });
    }

    // Checking if they tried to create task but forgot description/delimiter
    if (cleanMsgLower.startsWith('create task') || cleanMsgLower.startsWith('add task')) {
      return res.json({
        response: `💡 To create a task, please use the dash delimiter to separate the Title and Description:
        
\`create task: [Title] - [Description (min 20 characters)]\`
        
Example: \`create task: Code Auth - Implement JWT controllers and middlewares\``,
        action: 'help',
        refresh: false
      });
    }

    // 3. Complete Task Intent
    // Matches "complete task: [ID or Title]" or "finish task: [ID or Title]"
    const completeRegex = /^(?:complete|finish)\s+task:?\s*(.+)$/i;
    const completeMatch = cleanMsg.match(completeRegex);
    if (completeMatch) {
      const searchKey = completeMatch[1].trim();
      let task;

      // Check if searchKey is integer ID
      if (/^\d+$/.test(searchKey)) {
        task = await Task.findOne({ where: { id: parseInt(searchKey, 10), userId } });
      } else {
        task = await Task.findOne({
          where: {
            userId,
            title: { [Op.like]: `%${searchKey}%` }
          }
        });
      }

      if (!task) {
        return res.json({
          response: `❌ Task matching "${searchKey}" could not be found. Make sure you own the task or verify the spelling/ID.`,
          action: 'error',
          refresh: false
        });
      }

      if (task.status === 'Completed') {
        return res.json({
          response: `ℹ️ Task "${task.title}" is already marked as Completed.`,
          action: 'info',
          refresh: false
        });
      }

      task.status = 'Completed';
      await task.save();

      return res.json({
        response: `🎉 Task updated successfully!
        
✅ Marked **"${task.title}"** (ID: ${task.id}) as **Completed**.`,
        action: 'complete',
        refresh: true
      });
    }

    // 4. Delete Task Intent
    // Matches "delete task: [ID or Title]" or "remove task: [ID or Title]"
    const deleteRegex = /^(?:delete|remove)\s+task:?\s*(.+)$/i;
    const deleteMatch = cleanMsg.match(deleteRegex);
    if (deleteMatch) {
      const searchKey = deleteMatch[1].trim();
      let task;

      if (/^\d+$/.test(searchKey)) {
        task = await Task.findOne({ where: { id: parseInt(searchKey, 10), userId } });
      } else {
        task = await Task.findOne({
          where: {
            userId,
            title: { [Op.like]: `%${searchKey}%` }
          }
        });
      }

      if (!task) {
        return res.json({
          response: `❌ Task matching "${searchKey}" could not be found to delete.`,
          action: 'error',
          refresh: false
        });
      }

      const taskTitle = task.title;
      const taskId = task.id;
      await task.destroy();

      return res.json({
        response: `🗑️ Task deleted successfully!
        
Removed task **"${taskTitle}"** (ID: ${taskId}).`,
        action: 'delete',
        refresh: true
      });
    }

    // 5. List Tasks Intent
    // Matches "list tasks", "list pending tasks", "list completed tasks", etc.
    const listRegex = /^(?:list|show)\s+(pending|completed|in progress|all)?\s*tasks$/i;
    const listMatch = cleanMsgLower.match(listRegex);
    if (listMatch) {
      const statusType = listMatch[1];
      const where = { userId };

      if (statusType === 'pending') {
        where.status = 'Pending';
      } else if (statusType === 'completed') {
        where.status = 'Completed';
      } else if (statusType === 'in progress') {
        where.status = 'In Progress';
      }

      const tasks = await Task.findAll({
        where,
        order: [['createdAt', 'DESC']]
      });

      if (tasks.length === 0) {
        return res.json({
          response: `📭 You do not have any ${statusType || ''} tasks stored.`,
          action: 'list',
          refresh: false
        });
      }

      const statusTitle = statusType ? `${statusType.charAt(0).toUpperCase() + statusType.slice(1)} ` : '';
      let taskLines = `📋 Here is the list of your **${statusTitle}Tasks** (ordered by newest):\n\n`;
      tasks.forEach((t) => {
        const badge = t.status === 'Completed' ? '✅' : t.status === 'In Progress' ? '⚡' : '⏳';
        taskLines += `${badge} **ID: ${t.id}** | ${t.title} [${t.status}]\n`;
      });

      return res.json({
        response: taskLines,
        action: 'list',
        refresh: false
      });
    }

    // 6. Statistics / Summary Intent
    if (['stats', 'summary', 'statistics', 'count', 'total'].includes(cleanMsgLower)) {
      const [total, pending, inProgress, completed] = await Promise.all([
        Task.count({ where: { userId } }),
        Task.count({ where: { userId, status: 'Pending' } }),
        Task.count({ where: { userId, status: 'In Progress' } }),
        Task.count({ where: { userId, status: 'Completed' } })
      ]);

      return res.json({
        response: `📊 **Task Statistics Dashboard**
        
📁 Total Tasks: **${total}**
⏳ Pending: **${pending}**
⚡ In Progress: **${inProgress}**
✅ Completed: **${completed}**`,
        action: 'stats',
        refresh: false
      });
    }

    // 7. General Fallback Command
    return res.json({
      response: `🧠 I processed your message: "${cleanMsg}" but couldn't map it to a specific command.
      
If you'd like to create a task or update one, try these keywords:
• To create: \`create task: [Title] - [Description (min 20 characters)]\`
• To list: \`list tasks\`
• To complete: \`complete task: [ID or Title]\`
• Type \`help\` to see the full options.`,
      action: 'unknown',
      refresh: false
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleBotMessage
};
