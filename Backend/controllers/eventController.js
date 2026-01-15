const { ObjectId } = require('mongodb');
const { Event } = require('../models');

const eventController = {
  // Get all upcoming events
  getAllEvents: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const events = await Event.findAll({
        page,
        limit,
        upcomingOnly: true,
        includeRSVPCounts: true
      });

      res.json({
        success: true,
        data: {
          events,
          pagination: {
            page,
            limit,
            total: events.length
          }
        }
      });

    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while fetching events'
      });
    }
  },

  // Get event by ID
  getEventById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      const event = await Event.findById(id, true);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      res.json({
        success: true,
        data: {
          event
        }
      });

    } catch (error) {
      console.error('Get event error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while fetching event'
      });
    }
  },

  // Create new event
  createEvent: async (req, res) => {
    try {
      const { title, description, date, start_time, end_time, location } = req.body;
      const created_by = req.user.userId;

      // Validate date is not in the past
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        return res.status(400).json({
          success: false,
          error: 'Event date cannot be in the past'
        });
      }

      // Validate end time is after start time
      if (start_time >= end_time) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
      }

      const event = await Event.create({
        title,
        description,
        date,
        start_time,
        end_time,
        location,
        created_by
      });

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: {
          event
        }
      });

    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while creating event'
      });
    }
  },

  // Update event
  updateEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, date, start_time, end_time, location } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      // Check if event exists
      const existingEvent = await Event.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      // Validate date is not in the past
      if (date) {
        const eventDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
          return res.status(400).json({
            success: false,
            error: 'Event date cannot be in the past'
          });
        }
      }

      // Validate end time is after start time
      if (start_time && end_time && start_time >= end_time) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
      }

      const updates = {};
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (date) updates.date = date;
      if (start_time) updates.start_time = start_time;
      if (end_time) updates.end_time = end_time;
      if (location) updates.location = location;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const event = await Event.update(id, updates);

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: {
          event
        }
      });

    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while updating event'
      });
    }
  },

  // Delete event
  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      // Check if event exists
      const existingEvent = await Event.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      await Event.delete(id);

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });

    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while deleting event'
      });
    }
  },

  // Get RSVP summary for event
  // Get RSVP summary for event - NO CHANGES
getRsvpSummary: async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id",id);
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID'
      });
    }

    // Get RSVP summary - this will work with the fixed method above
    const summary = await Event.getRsvpSummary(id);
    
    // Get detailed user list - this will work with the fixed method above
    const users = await Event.getRsvpUsers(id);

    res.json({
      success: true,
      data: {
        summary,
        users
      }
    });

  } catch (error) {
    console.error('Get RSVP summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching RSVP summary'
    });
  }
}
};

module.exports = eventController;