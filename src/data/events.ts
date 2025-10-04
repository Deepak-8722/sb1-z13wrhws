import { CampusEvent } from '../types/events';

let campusEvents: CampusEvent[] = [
  {
    id: '1',
    name: 'Welcome Week Orientation',
    description: 'Join us for an exciting week of activities designed to help new students get acquainted with campus life, meet fellow students, and learn about available resources.',
    date: '2025-01-20',
    time: '9:00 AM - 5:00 PM',
    venue: 'Campus Commons',
    category: 'orientation',
    organizer: 'Student Affairs Office',
    registrationRequired: true,
    capacity: 500,
    registeredCount: 342,
    tags: ['new-students', 'orientation', 'networking']
  },
  {
    id: '2',
    name: 'AI & Machine Learning Symposium',
    description: 'A comprehensive symposium featuring industry experts discussing the latest trends in artificial intelligence and machine learning applications.',
    date: '2025-01-25',
    time: '10:00 AM - 4:00 PM',
    venue: 'Science & Technology Center',
    category: 'academic',
    organizer: 'Computer Science Department',
    registrationRequired: true,
    capacity: 200,
    registeredCount: 156,
    tags: ['technology', 'AI', 'research', 'symposium']
  },
  {
    id: '3',
    name: 'Spring Concert Series',
    description: 'An evening of musical performances featuring student bands, solo artists, and special guest performers from the local music scene.',
    date: '2025-01-28',
    time: '7:00 PM - 10:00 PM',
    venue: 'Campus Amphitheater',
    category: 'cultural',
    organizer: 'Music Department',
    registrationRequired: false,
    tags: ['music', 'performance', 'entertainment']
  },
  {
    id: '4',
    name: 'Career Fair 2025',
    description: 'Connect with top employers from various industries. Bring your resume and dress professionally for this networking opportunity.',
    date: '2025-02-02',
    time: '11:00 AM - 4:00 PM',
    venue: 'Fitness & Recreation Center',
    category: 'career',
    organizer: 'Career Services',
    registrationRequired: true,
    capacity: 1000,
    registeredCount: 678,
    tags: ['career', 'networking', 'jobs', 'internships']
  },
  {
    id: '5',
    name: 'Basketball vs. State University',
    description: 'Cheer on our Eagles as they take on State University in this exciting home game. Student tickets are free with ID.',
    date: '2025-02-05',
    time: '7:30 PM - 9:30 PM',
    venue: 'University Arena',
    category: 'sports',
    organizer: 'Athletics Department',
    registrationRequired: false,
    tags: ['basketball', 'sports', 'competition']
  },
  {
    id: '6',
    name: 'Sustainability Workshop',
    description: 'Learn practical ways to live more sustainably on campus and beyond. Topics include waste reduction, energy conservation, and eco-friendly practices.',
    date: '2025-02-08',
    time: '2:00 PM - 4:00 PM',
    venue: 'Johnson Hall - Room 205',
    category: 'workshop',
    organizer: 'Environmental Club',
    registrationRequired: true,
    capacity: 50,
    registeredCount: 23,
    tags: ['sustainability', 'environment', 'workshop']
  },
  {
    id: '7',
    name: 'International Food Festival',
    description: 'Celebrate diversity with food from around the world prepared by international student organizations. Free samples and cultural performances.',
    date: '2025-02-12',
    time: '12:00 PM - 6:00 PM',
    venue: 'Student Plaza',
    category: 'cultural',
    organizer: 'International Student Association',
    registrationRequired: false,
    tags: ['food', 'culture', 'international', 'festival']
  },
  {
    id: '8',
    name: 'Community Service Day',
    description: 'Join fellow students in giving back to the local community through various volunteer opportunities including park cleanup and food bank assistance.',
    date: '2025-02-15',
    time: '8:00 AM - 3:00 PM',
    venue: 'Various Locations',
    category: 'volunteer',
    organizer: 'Community Outreach Office',
    registrationRequired: true,
    capacity: 150,
    registeredCount: 89,
    tags: ['volunteer', 'community', 'service']
  },
  {
    id: '9',
    name: 'Poetry Night Open Mic',
    description: 'Share your original poetry or enjoy performances by fellow students in this intimate evening of creative expression.',
    date: '2025-02-18',
    time: '7:00 PM - 9:00 PM',
    venue: 'Memorial Library - Reading Room',
    category: 'cultural',
    organizer: 'Creative Writing Club',
    registrationRequired: false,
    tags: ['poetry', 'open-mic', 'creative', 'literature']
  },
  {
    id: '10',
    name: 'Study Abroad Information Session',
    description: 'Discover exciting study abroad opportunities, learn about application processes, scholarships, and hear from students who have studied internationally.',
    date: '2025-02-22',
    time: '4:00 PM - 6:00 PM',
    venue: 'Administration Building - Conference Room',
    category: 'academic',
    organizer: 'Study Abroad Office',
    registrationRequired: true,
    capacity: 75,
    registeredCount: 45,
    tags: ['study-abroad', 'international', 'education']
  }
];

export { campusEvents };

// Admin functions to modify events
export const addEvent = (event: CampusEvent) => {
  campusEvents = [...campusEvents, event];
};

export const updateEvent = (updatedEvent: CampusEvent) => {
  campusEvents = campusEvents.map(event => 
    event.id === updatedEvent.id ? updatedEvent : event
  );
};

export const deleteEvent = (eventId: string) => {
  campusEvents = campusEvents.filter(event => event.id !== eventId);
};