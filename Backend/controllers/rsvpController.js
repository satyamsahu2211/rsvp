const { ObjectId } = require('mongodb');
const { RSVP, Event } = require('../models');

const rsvpController = {
  // Get user's RSVPs
  getUserRsvps: async (req, res) => {    
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const rsvps = await RSVP.findByUser(userId, { page, limit });

      res.json({
        success: true,
        data: { 
          rsvps,
          pagination: {
            page,
            limit,
            total: rsvps.length
          }
        }
      });

    } catch (error) {
      console.error('Get user RSVPs error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while fetching RSVPs'
      });
    }
  },

  // Create or update RSVP
  upsertRsvp: async (req, res) => {
    try {
      const { event_id, status } = req.body;
      const user_id = req.user.userId;

      if (!ObjectId.isValid(event_id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      // Validate event exists
      const event = await Event.findById(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      // Check if event has already passed
      const eventDateTime = new Date(`${event.date}T${event.end_time}`);
      if (eventDateTime < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Cannot RSVP to past events'
        });
      }

      // Check if RSVP already exists
      const existingRsvp = await RSVP.findByUserAndEvent(user_id, event_id);

      const rsvp = await RSVP.upsert({
        user_id,
        event_id,
        status
      });

      res.json({
        success: true,
        message: existingRsvp ? 'RSVP updated successfully' : 'RSVP created successfully',
        data: {
          rsvp
        }
      });

    } catch (error) {
      console.error('Upsert RSVP error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while processing RSVP'
      });
    }
  },

  // Get RSVP status for specific event
  getEventRsvp: async (req, res) => {
    try {
      const { event_id } = req.params;
      const user_id = req.user.userId;

      if (!ObjectId.isValid(event_id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      const rsvp = await RSVP.findByUserAndEvent(user_id, event_id);

      if (!rsvp) {
        return res.status(404).json({
          success: true,
          data: {
            rsvp: null
          }
        });
      }

      res.json({
        success: true,
        data: {
          rsvp
        }
      });

    } catch (error) {
      console.error('Get event RSVP error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while fetching RSVP'
      });
    }
  },

  // Delete RSVP
  deleteRsvp: async (req, res) => {
    try {
      const { event_id } = req.params;
      const user_id = req.user.userId;

      if (!ObjectId.isValid(event_id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID'
        });
      }

      const rsvp = await RSVP.delete(user_id, event_id);

      if (!rsvp) {
        return res.status(404).json({
          success: false,
          error: 'RSVP not found'
        });
      }

      res.json({
        success: true,
        message: 'RSVP deleted successfully'
      });

    } catch (error) {
      console.error('Delete RSVP error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error while deleting RSVP'
      });
    }
  }
};

module.exports = rsvpController;