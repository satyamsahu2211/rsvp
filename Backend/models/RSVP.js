const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class RSVP {
  static collection() {
    return getDB().collection('rsvps');
  }

  // Find RSVP by user and event
  static async findByUserAndEvent(userId, eventId) {
    try {
      const result = await this.collection().aggregate([
        {
          $match: {
            user_id: new ObjectId(userId),
            event_id: new ObjectId(eventId)
          }
        },
        {
          $lookup: {
            from: 'events',
            localField: 'event_id',
            foreignField: '_id',
            as: 'event'
          }
        },
        {
          $unwind: '$event'
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            event_id: 1,
            status: 1,
            created_at: 1,
            updated_at: 1,
            event_title: '$event.title',
            event_date: '$event.date',
            event_start_time: '$event.start_time',
            event_location: '$event.location'
          }
        }
      ]).toArray();

      return result[0] || null;
    } catch (error) {
      throw new Error(`Error finding RSVP by user and event: ${error.message}`);
    }
  }

  // Find all RSVPs for user
  static async findByUser(userId, options = {}) {
    try {
      const { page = 1, limit = 10, upcomingOnly = false } = options;
      const skip = (page - 1) * limit;

      const matchStage = {
        user_id: new ObjectId(userId)
      };

      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'events',
            localField: 'event_id',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$event' },
        {
          $lookup: {
            from: 'users',
            localField: 'event.created_by',
            foreignField: '_id',
            as: 'organizer'
          }
        },
        { $unwind: '$organizer' }
      ];

      if (upcomingOnly) {
        pipeline.push({
          $match: {
            'event.date': { $gte: new Date().toISOString().split('T')[0] }
          }
        });
      }

      // Add event status
      pipeline.push({
        $addFields: {
          event_status: {
            $cond: {
              if: {
                $or: [
                  { $lt: ['$event.date', new Date().toISOString().split('T')[0]] },
                  {
                    $and: [
                      { $eq: ['$event.date', new Date().toISOString().split('T')[0]] },
                      { $lt: ['$event.end_time', new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })] }
                    ]
                  }
                ]
              },
              then: 'past',
              else: 'upcoming'
            }
          }
        }
      });

      pipeline.push(
        { $sort: { 'event.date': -1, 'event.start_time': -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            user_id: 1,
            event_id: 1,
            status: 1,
            created_at: 1,
            updated_at: 1,
            title: '$event.title',
            description: '$event.description',
            date: '$event.date',
            start_time: '$event.start_time',
            end_time: '$event.end_time',
            location: '$event.location',
            organizer_name: '$organizer.name',
            event_status: 1
          }
        }
      );

      const result = await this.collection().aggregate(pipeline).toArray();
      return result;
    } catch (error) {
      throw new Error(`Error finding RSVPs by user: ${error.message}`);
    }
  }

  // Create or update RSVP
  static async upsert(rsvpData) {
    try {
      const { user_id, event_id, status } = rsvpData;

      const filter = {
        user_id: new ObjectId(user_id),
        event_id: new ObjectId(event_id)
      };

      const update = {
        $set: {
          status,
          updated_at: new Date()
        },
        $setOnInsert: {
          created_at: new Date()
        }
      };

      const options = {
        upsert: true,
        returnDocument: 'after'
      };

      const result = await this.collection().findOneAndUpdate(filter, update, options);
      return result.value;
    } catch (error) {
      throw new Error(`Error upserting RSVP: ${error.message}`);
    }
  }

  // Delete RSVP
  static async delete(userId, eventId) {
    try {
      const result = await this.collection().findOneAndDelete({
        user_id: new ObjectId(userId),
        event_id: new ObjectId(eventId)
      });
      return result.value;
    } catch (error) {
      throw new Error(`Error deleting RSVP: ${error.message}`);
    }
  }

  // Get RSVPs for event
  static async findByEvent(eventId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const result = await this.collection().aggregate([
        { $match: { event_id: new ObjectId(eventId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            user_id: 1,
            event_id: 1,
            status: 1,
            created_at: 1,
            updated_at: 1,
            user_name: '$user.name',
            user_email: '$user.email'
          }
        }
      ]).toArray();

      return result;
    } catch (error) {
      throw new Error(`Error finding RSVPs by event: ${error.message}`);
    }
  }

  // Get RSVP statistics for user
  static async getUserStats(userId) {
    try {
      const result = await this.collection().aggregate([
        {
          $match: {
            user_id: new ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: 'events',
            localField: 'event_id',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$event' },
        {
          $match: {
            'event.date': { $gte: new Date().toISOString().split('T')[0] }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $addFields: {
            status: '$_id'
          }
        },
        { $project: { _id: 0 } }
      ]).toArray();

      return result;
    } catch (error) {
      throw new Error(`Error getting user RSVP stats: ${error.message}`);
    }
  }
}

module.exports = RSVP;