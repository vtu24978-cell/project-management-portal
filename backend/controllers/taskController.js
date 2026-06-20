const { Op } = require('sequelize');
const Task = require('../models/Task');
const { sendTaskNotification } = require('../utils/mailer');

// @desc    Get all tasks with filtering, search, pagination, sorting & statistics
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, search, sortBy, order, page, limit } = req.query;
    const userId = req.user.id;

    // 1. Base Where Clause
    const where = { userId };

    // Filter by status if specified
    if (status && ['Pending', 'In Progress', 'Completed'].includes(status)) {
      where.status = status;
    }

    // Search by title or description
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // 2. Pagination Details
    const pageVal = parseInt(page, 10) || 1;
    const limitVal = parseInt(limit, 10) || 6;
    const offset = (pageVal - 1) * limitVal;

    // 3. Sorting Details
    const validSortFields = ['createdAt', 'dueDate', 'title', 'status'];
    const sortByVal = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderVal = order && ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    // 4. Execute Paginated Query
    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      limit: limitVal,
      offset,
      order: [[sortByVal, orderVal]]
    });

    // 5. Gather Stats (For current user - ignoring the current filters/search)
    const [total, pending, inProgress, completed] = await Promise.all([
      Task.count({ where: { userId } }),
      Task.count({ where: { userId, status: 'Pending' } }),
      Task.count({ where: { userId, status: 'In Progress' } }),
      Task.count({ where: { userId, status: 'Completed' } })
    ]);

    res.json({
      tasks,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limitVal),
        currentPage: pageVal,
        limit: limitVal
      },
      stats: {
        total,
        pending,
        inProgress,
        completed
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, dueDate, assigneeName, assigneeEmail } = req.body;
    const userId = req.user.id;

    const task = await Task.create({
      title,
      description,
      status: status || 'Pending',
      dueDate: dueDate || null,
      assigneeName: assigneeName || null,
      assigneeEmail: assigneeEmail || null,
      userId
    });

    // Fire email notification asynchronously if assignee email is provided
    if (assigneeEmail) {
      sendTaskNotification(
        assigneeEmail,
        assigneeName || 'Assignee',
        title,
        description
      ).catch((err) => {
        console.error('[EMAIL] Failed to send task notification:', err.message);
      });
    }

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate, assigneeName, assigneeEmail } = req.body;
    const userId = req.user.id;

    // Find the task and verify ownership
    const task = await Task.findOne({ where: { id, userId } });

    if (!task) {
      res.status(404);
      throw new Error('Task not found or unauthorized');
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (assigneeName !== undefined) task.assigneeName = assigneeName || null;
    if (assigneeEmail !== undefined) task.assigneeEmail = assigneeEmail || null;

    await task.save();

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the task and verify ownership
    const task = await Task.findOne({ where: { id, userId } });

    if (!task) {
      res.status(404);
      throw new Error('Task not found or unauthorized');
    }

    await task.destroy();

    res.json({ message: 'Task deleted successfully', id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
