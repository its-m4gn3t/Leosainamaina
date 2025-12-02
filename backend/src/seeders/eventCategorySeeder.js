const EventCategory = require('../models/eventCategoryModel');

const defaultCategories = [
  { name: 'Service', description: 'Community service activities', color: '#10B981' },
  { name: 'Meeting', description: 'Club meetings and assemblies', color: '#3B82F6' },
  { name: 'Training', description: 'Skill development and training sessions', color: '#8B5CF6' },
  { name: 'Fundraising', description: 'Fundraising events and activities', color: '#F59E0B' },
  { name: 'Social', description: 'Social gatherings and networking', color: '#EF4444' },
  { name: 'Environmental', description: 'Environmental conservation activities', color: '#059669' },
  { name: 'Education', description: 'Educational programs and workshops', color: '#7C3AED' }
];

const seedEventCategories = async () => {
  try {
    const existingCount = await EventCategory.countDocuments();
    if (existingCount > 0) {
      console.log('Event categories already exist, skipping seeding');
      return;
    }

    await EventCategory.insertMany(defaultCategories);
    console.log('Default event categories seeded successfully');
  } catch (error) {
    console.error('Error seeding event categories:', error);
  }
};

module.exports = { seedEventCategories };