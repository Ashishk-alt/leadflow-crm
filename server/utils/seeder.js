const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Lead = require('../models/Lead');

dotenv.config();

const usersData = [
  {
    name: 'John Doe',
    email: 'john@leadflow.com',
    password: 'password123',
    role: 'BDA',
  },
  {
    name: 'Sarah Connor',
    email: 'sarah@leadflow.com',
    password: 'password123',
    role: 'BDA',
  },
  {
    name: 'Mike Tyson',
    email: 'mike@leadflow.com',
    password: 'password123',
    role: 'BDA',
  },
  {
    name: 'Ashish Manager',
    email: 'manager@leadflow.com',
    password: 'password123',
    role: 'Manager',
  }
];

const mockLeads = (userIds) => [
  {
    name: 'Robert Downey',
    company: 'Stark Manufacturing Corp',
    email: 'robert@starkmfg.com',
    phone: '+1 (555) 123-4567',
    status: 'New',
    priority: 'High',
    estimatedValue: 125000,
    notes: 'Inquired about custom structural titanium alloy beams. Wants bulk volume discount tables.',
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
    createdBy: userIds[0],
    assignedTo: userIds[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
  },
  {
    name: 'Elon Musk',
    company: 'SpaceX Assembly Lines',
    email: 'elon@spacex.com',
    phone: '+1 (555) 987-6543',
    status: 'Contacted',
    priority: 'High',
    estimatedValue: 350000,
    notes: 'Needs custom nozzle castings for thruster assembly. Sent spec sheets. Waiting on review.',
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
    createdBy: userIds[0],
    assignedTo: userIds[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25), // 25 days ago
  },
  {
    name: 'Bruce Wayne',
    company: 'Wayne Enterprises Foundry',
    email: 'bruce@waynecorp.com',
    phone: '+1 (555) 246-8101',
    status: 'Interested',
    priority: 'High',
    estimatedValue: 480000,
    notes: 'Interested in acquiring 500 tons of high-grade carbon-fiber reinforced steel plates. Scheduled call for pricing negotiation.',
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // Tomorrow
    createdBy: userIds[0],
    assignedTo: userIds[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
  },
  {
    name: 'Pepper Potts',
    company: 'Resilient Metal Solutions',
    email: 'pepper@resilientmetal.com',
    phone: '+1 (555) 369-2580',
    status: 'Proposal Sent',
    priority: 'Medium',
    estimatedValue: 85000,
    notes: 'Sent pricing proposal for automatic stamping press supplies. Follow up on Monday.',
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // 4 days from now
    createdBy: userIds[1],
    assignedTo: userIds[1],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
  },
  {
    name: 'Henry Ford',
    company: 'Ford Assembly & Stamping',
    email: 'henry@fordassembly.com',
    phone: '+1 (555) 147-2589',
    status: 'Closed',
    priority: 'High',
    estimatedValue: 620000,
    notes: 'Purchase order signed. 12 hydraulic presses ordered. Delivery scheduled for August.',
    followUpDate: null,
    createdBy: userIds[1],
    assignedTo: userIds[1],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35), // 35 days ago
  },
  {
    name: 'Steve Rogers',
    company: 'Shield Steel Fabrication',
    email: 'steve@shieldsteel.org',
    phone: '+1 (555) 258-3691',
    status: 'Interested',
    priority: 'Medium',
    estimatedValue: 75000,
    notes: 'Inquired about vibration-absorption metallurgy properties. Provided product catalogs.',
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6), // 6 days from now
    createdBy: userIds[1],
    assignedTo: userIds[1],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
  },
  {
    name: 'Arthur Dent',
    company: 'Galaxy Plastics & Pipes',
    email: 'arthur@galaxyplastics.net',
    phone: '+1 (555) 789-1011',
    status: 'New',
    priority: 'Low',
    estimatedValue: 24000,
    notes: 'Needs standard PVC industrial fittings. Minimal customization requested.',
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // 10 days from now
    createdBy: userIds[2],
    assignedTo: userIds[2],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    name: 'Diana Prince',
    company: 'Themyscira Castings Ltd',
    email: 'diana@themysciracast.com',
    phone: '+1 (555) 321-7654',
    status: 'Proposal Sent',
    priority: 'High',
    estimatedValue: 195000,
    notes: 'Proposal sent for advanced continuous brass casting machinery setup.',
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    createdBy: userIds[2],
    assignedTo: userIds[2],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 days ago
  },
  {
    name: 'Thomas Edison',
    company: 'General Industrial Filament',
    email: 'thomas@genfilament.com',
    phone: '+1 (555) 852-9630',
    status: 'Closed',
    priority: 'Medium',
    estimatedValue: 135000,
    notes: 'Contract sealed. Bulk distribution of tungsten welding wires completed and billed.',
    followUpDate: null,
    createdBy: userIds[2],
    assignedTo: userIds[2],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
  },
  {
    name: 'Peter Parker',
    company: 'Web Stamping Solutions',
    email: 'peter@webstamping.com',
    phone: '+1 (555) 963-8520',
    status: 'Contacted',
    priority: 'Low',
    estimatedValue: 15000,
    notes: 'Followed up via phone. BDA provided catalogs for high tensile springs.',
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // Tomorrow
    createdBy: userIds[0],
    assignedTo: userIds[2], // Cross assigned to Mike
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
  },
  {
    name: 'Tony Stark',
    company: 'Stark Industries Energy Hub',
    email: 'tony@stark.com',
    phone: '+1 (555) 000-3000',
    status: 'Closed',
    priority: 'High',
    estimatedValue: 950000,
    notes: 'Arc reactor heavy copper coils shipment complete. Large deal closure for Year 2026.',
    followUpDate: null,
    createdBy: userIds[0],
    assignedTo: userIds[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 90 days ago
  }
];

const importData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leadflow-crm');
    console.log('Database connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Lead.deleteMany();
    console.log('Database cleared of existing Users and Leads.');

    // Pre-hash passwords since Mongoose pre-save middleware doesn't trigger on direct insertMany if passwords aren't hashed
    // But actually, if we create them one by one or hash them first, Mongoose pre-save hook DOES run if we do User.create().
    // Let's use User.create for all users to ensure password hashing pre-save hook is triggered correctly!
    const users = [];
    for (let u of usersData) {
      const createdUser = await User.create(u);
      users.push(createdUser);
    }
    console.log(`${users.length} Users seeded successfully!`);

    const userIds = users.map(u => u._id);

    // Seed Leads
    const leadsToSeed = mockLeads(userIds);
    await Lead.insertMany(leadsToSeed);
    console.log(`${leadsToSeed.length} Leads seeded successfully!`);

    console.log('Data import complete!');
    process.exit();
  } catch (error) {
    console.error(`Error with data seeding: ${error.message}`);
    process.exit(1);
  }
};

importData();
