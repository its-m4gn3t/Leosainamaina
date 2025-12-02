const Event = require('../models/eventModel');
const EventCategory = require('../models/eventCategoryModel');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('category').sort({ startDate: -1 });
    // Update status for all events
    await updateEventStatuses();
    res.status(200).json(Array.isArray(events) ? events : []);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: error.message, events: [] });
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    await updateEventStatuses();
    const events = await Event.find({ status: { $in: ['upcoming', 'ongoing'] } })
      .populate('category')
      .sort({ startDate: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get past events
const getPastEvents = async (req, res) => {
  try {
    await updateEventStatuses();
    const events = await Event.find({ status: 'completed' })
      .populate('category')
      .sort({ startDate: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('category');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { title, category, startDate, endDate, totalHours, banner } = req.body;
    
    // Validation
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, start date, and end date are required' });
    }
    
    const newEvent = new Event({ 
      title, 
      category: category || null, 
      startDate, 
      endDate, 
      totalHours: totalHours || 1, 
      banner: banner || null 
    });
    
    await newEvent.save();
    const populatedEvent = await Event.findById(newEvent._id).populate('category');
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category');
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update event statuses based on current date
const updateEventStatuses = async () => {
  try {
    const events = await Event.find();
    const now = new Date();
    
    for (const event of events) {
      if (!event.startDate || !event.endDate) continue;
      
      let newStatus;
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      if (now < startDate) {
        newStatus = 'upcoming';
      } else if (now >= startDate && now <= endDate) {
        newStatus = 'ongoing';
      } else {
        newStatus = 'completed';
      }
      
      if (event.status !== newStatus) {
        await Event.findByIdAndUpdate(event._id, { status: newStatus });
      }
    }
  } catch (error) {
    console.error('Error updating event statuses:', error);
  }
};

module.exports = {
  getAllEvents,
  getUpcomingEvents,
  getPastEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatuses
};
