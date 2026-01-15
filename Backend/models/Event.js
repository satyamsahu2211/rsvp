const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class Event {
  static collection() {
    return getDB().collection('events');
  }

  // Find all events with pagination and filters
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        upcomingOnly = true,
        includeRSVPCounts = false
      } = options;

      const skip = (page - 1) * limit;
      const matchStage = {};
      
      if (upcomingOnly) {
        matchStage.date = { $gte: new Date().toISOString().split('T')[0] };
      }

      let pipeline = [
        { $match: matchStage },
        { $sort: { date: 1, start_time: 1 } },
        { $skip: skip },
        { $limit: limit }
      ];

      if (includeRSVPCounts) {
        pipeline = [
          ...pipeline,
          {
            $lookup: {
              from: 'rsvps',
              localField: '_id',
              foreignField: 'event_id',
              as: 'rsvps'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'created_by',
              foreignField: '_id',
              as: 'creator'
            }
          },
          {
            $addFields: {
              created_by_name: { $arrayElemAt: ['$creator.name', 0] },
              total_rsvps: { $size: '$rsvps' },
              going_count: {
                $size: {
                  $filter: {
                    input: '$rsvps',
                    as: 'rsvp',
                    cond: { $eq: ['$$rsvp.status', 'going'] }
                  }
                }
              },
              maybe_count: {
                $size: {
                  $filter: {
                    input: '$rsvps',
                    as: 'rsvp',
                    cond: { $eq: ['$$rsvp.status', 'maybe'] }
                  }
                }
              },
              decline_count: {
                $size: {
                  $filter: {
                    input: '$rsvps',
                    as: 'rsvp',
                    cond: { $eq: ['$$rsvp.status', 'decline'] }
                  }
                }
              }
            }
          },
          { $project: { creator: 0 } }
        ];
      } else {
        pipeline = [
          ...pipeline,
          {
            $lookup: {
              from: 'users',
              localField: 'created_by',
              foreignField: '_id',
              as: 'creator'
            }
          },
          {
            $addFields: {
              created_by_name: { $arrayElemAt: ['$creator.name', 0] }
            }
          },
          { $project: { creator: 0 } }
        ];
      }

      const result = await this.collection().aggregate(pipeline).toArray();
      return result;
    } catch (error) {
      throw new Error(`Error finding events: ${error.message}`);
    }
  }

  // Find event by ID
  static async findById(id, includeRSVPCounts = false) {
    try {
      const pipeline = [
        { $match: { _id: new ObjectId(id) } }
      ];

      if (includeRSVPCounts) {
        pipeline.push(
          {
            $lookup: {
              from: 'rsvps',
              localField: '_id',
              foreignField: 'event_id',
              as: 'rsvps'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'created_by',
              foreignField: '_id',
              as: 'creator'
            }
          },
          {
            $addFields: {
              created_by_name: { $arrayElemAt: ['$creator.name', 0] },
              total_rsvps: { $size: '$rsvps' },
              going_count: {
                $size: {
                  $filter: {
                    input: '$rsvps',
                    as: 'rsvp',
                    cond: { $eq: ['$$rsvp.status', 'going'] }
                  }
                }
              },
              maybe_count: {
                $size: {
                  $filter: {
                    input: '$rsvps',
                    as: 'rsvp',
                    cond: { $eq: ['$$rsvp.status', 'maybe'] }
                  }
                }
              },
              decline_count: {
                $size: {
                  $filter: {
                    input: '$rsvps',
                    as: 'rsvp',
                    cond: { $eq: ['$$rsvp.status', 'decline'] }
                  }
                }
              }
            }
          },
          { $project: { creator: 0 } }
        );
      } else {
        pipeline.push(
          {
            $lookup: {
              from: 'users',
              localField: 'created_by',
              foreignField: '_id',
              as: 'creator'
            }
          },
          {
            $addFields: {
              created_by_name: { $arrayElemAt: ['$creator.name', 0] }
            }
          },
          { $project: { creator: 0 } }
        );
      }

      const result = await this.collection().aggregate(pipeline).toArray();
      return result[0] || null;
    } catch (error) {
      throw new Error(`Error finding event by ID: ${error.message}`);
    }
  }

  // Create new event
  static async create(eventData) {
    try {
      const { title, description, date, start_time, end_time, location, created_by } = eventData;

      const event = {
        title,
        description,
        date,
        start_time,
        end_time,
        location,
        created_by: new ObjectId(created_by),
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await this.collection().insertOne(event);
      
      return {
        _id: result.insertedId,
        ...event
      };
    } catch (error) {
      throw new Error(`Error creating event: ${error.message}`);
    }
  }

  // Update event
  static async update(id, updates) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date()
      };

      const result = await this.collection().findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      return result.value;
    } catch (error) {
      throw new Error(`Error updating event: ${error.message}`);
    }
  }

  // Delete event
  static async delete(id) {
    try {
      // Delete associated RSVPs
      const rsvpCollection = getDB().collection('rsvps');
      await rsvpCollection.deleteMany({ event_id: new ObjectId(id) });

      // Delete event
      const result = await this.collection().findOneAndDelete(
        { _id: new ObjectId(id) }
      );
      
      return result.value;
    } catch (error) {
      throw new Error(`Error deleting event: ${error.message}`);
    }
  }

  // Find events by creator
  static async findByCreator(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const pipeline = [
        { $match: { created_by: new ObjectId(userId) } },
        { $sort: { created_at: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $addFields: {
            created_by_name: { $arrayElemAt: ['$creator.name', 0] }
          }
        },
        { $project: { creator: 0 } }
      ];

      const result = await this.collection().aggregate(pipeline).toArray();
      return result;
    } catch (error) {
      throw new Error(`Error finding events by creator: ${error.message}`);
    }
  }

  // Get RSVP summary for event
  // Get RSVP summary for event - WORKING FIX
static async getRsvpSummary(eventId) {
  try {
    const rsvpCollection = getDB().collection('rsvps');
    
    // First, get the counts grouped by status
    const counts = await rsvpCollection.aggregate([
      { $match: { event_id: new ObjectId(eventId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]).toArray();
    
    // Now sort them manually in JavaScript (going, maybe, decline order)
    const statusOrder = { 'going': 1, 'maybe': 2, 'decline': 3 };
    
    counts.sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      return orderA - orderB;
    });
    
    return counts;
  } catch (error) {
    throw new Error(`Error getting RSVP summary: ${error.message}`);
  }
}

  // Get detailed RSVP users for event
 // Get detailed RSVP users for event - SIMPLE WORKING VERSION
static async getRsvpUsers(eventId) {
  try {
    const rsvpCollection = getDB().collection('rsvps');
    const userCollection = getDB().collection('users');
    
    // Get all RSVPs for this event
    const allRsvps = await rsvpCollection.find({ 
      event_id: new ObjectId(eventId) 
    }).toArray();
    
    // Prepare result structure
    const usersByStatus = {};
    const statusOrder = ['going', 'maybe', 'decline'];
    
    // Initialize arrays
    statusOrder.forEach(status => {
      usersByStatus[status] = [];
    });
    
    // For each RSVP, get user details
    for (const rsvp of allRsvps) {
      // Only process valid statuses
      if (statusOrder.includes(rsvp.status)) {
        const user = await userCollection.findOne(
          { _id: rsvp.user_id },
          { projection: { name: 1, email: 1 } }
        );
        
        if (user) {
          usersByStatus[rsvp.status].push({
            user_id: user._id,
            name: user.name,
            email: user.email,
            rsvp_date: rsvp.created_at
          });
        }
      }
    }
    
    // Sort users by name within each status
    statusOrder.forEach(status => {
      usersByStatus[status].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return usersByStatus;
  } catch (error) {
    throw new Error(`Error getting RSVP users: ${error.message}`);
  }
}
}

module.exports = Event;