const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const backendEnv = path.join(__dirname, '..', '.env');
const rootEnv = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: fs.existsSync(backendEnv) ? backendEnv : rootEnv });

const User = require('../models/User');
const College = require('../models/College');
const Department = require('../models/Department');
const Course = require('../models/Course');
const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo@2026';
const summary = {
  users: 0, colleges: 0, departments: 0, courses: 0,
  academicYears: 0, semesters: 0, subjects: 0,
  studentProfiles: 0, facultyProfiles: 0
};

function increment(result, key) {
  if (result.upsertedCount || result.modifiedCount || result.matchedCount >= 0) summary[key]++;
}

async function upsertUser(data) {
  const password = await bcrypt.hash(DEMO_PASSWORD, 12);
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    existing.name = data.name;
    existing.role = data.role;
    existing.permissions = data.permissions || [];
    existing.college = data.college || null;
    existing.department = data.department || null;
    existing.accountStatus = 'active';
    existing.isActive = true;
    await existing.save();
    summary.users++;
    return existing;
  }

  const user = await User.create({
    ...data,
    email: data.email.toLowerCase(),
    password,
    accountStatus: 'active',
    isActive: true,
    emailVerified: true
  });
  summary.users++;
  return user;
}

async function seed() {
  if (process.env.DEMO_DATA_MODE !== 'true') {
    throw new Error('Demo seeding is disabled. Set DEMO_DATA_MODE=true to continue.');
  }
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');

  await mongoose.connect(process.env.MONGO_URI);

  const collegeResult = await College.findOneAndUpdate(
    { code: 'WMIT-DEMO' },
    {
      name: 'Western Maharashtra Institute of Technology',
      code: 'WMIT-DEMO',
      registrationDetails: 'Demo institution record - not a real affiliation',
      address: 'Pune, Maharashtra, India',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      contactNumber: '+91-20-5550-2026',
      email: 'info@example.edu.in',
      website: 'https://example.edu.in',
      affiliation: 'Savitribai Phule Pune University (SPPU) - Demo only',
      university: 'Savitribai Phule Pune University - Demo only',
      accreditation: 'Demo accreditation record',
      isActive: true
    },
    { new: true, upsert: true, runValidators: true }
  );
  summary.colleges++;

  const departmentSpecs = [
    ['Computer Engineering', 'COMP', 'Computer systems, software, algorithms, and computing applications.', 'Dr. Ananya Kulkarni', 'ananya.kulkarni@example.com', 32, 520, 2008],
    ['Information Technology', 'IT', 'Information systems, cloud computing, cybersecurity, and software engineering.', 'Dr. Rohan Patil', 'rohan.patil@example.com', 28, 480, 2009],
    ['Electronics and Telecommunication Engineering', 'ENTC', 'Communication systems, embedded systems, VLSI, and signal processing.', 'Dr. Meera Joshi', 'meera.joshi@example.com', 30, 440, 2007],
    ['Mechanical Engineering', 'MECH', 'Manufacturing, design, thermal systems, robotics, and automobile engineering.', 'Dr. Vivek Deshmukh', 'vivek.deshmukh@example.com', 34, 510, 2005],
    ['Civil Engineering', 'CIVIL', 'Structural systems, construction, transportation, geotechnical, and environmental engineering.', 'Dr. Kavita Shinde', 'kavita.shinde@example.com', 29, 430, 2005],
    ['Artificial Intelligence and Data Science', 'AIDS', 'Artificial intelligence, data science, machine learning, and analytics.', 'Dr. Siddharth Rao', 'siddharth.rao@example.com', 24, 360, 2021],
    ['Electrical Engineering', 'ELEC', 'Power systems, electrical machines, control systems, and renewable energy.', 'Dr. Neha Bhosale', 'neha.bhosale@example.com', 26, 390, 2006],
    ['First Year Engineering', 'FE', 'Foundation subjects, engineering sciences, mathematics, and laboratory skills.', 'Prof. Amit Naik', 'amit.naik@example.com', 18, 640, 2005]
  ];

  const departments = [];
  for (const [name, code, description, hodName, hodEmail, facultyCount, studentCount, establishedYear] of departmentSpecs) {
    const department = await Department.findOneAndUpdate(
      { college: collegeResult._id, code },
      {
        college: collegeResult._id, name, code, description, hodName, hodEmail,
        facultyCount, studentCount, establishedYear, isActive: true,
        icon: code === 'COMP' || code === 'AIDS' ? 'cpu' : code === 'MECH' ? 'settings' :
          code === 'CIVIL' ? 'building-2' : code === 'ENTC' ? 'radio' : code === 'ELEC' ? 'zap' : 'graduation-cap'
      },
      { new: true, upsert: true, runValidators: true }
    );
    departments.push(department);
    summary.departments++;
  }

  const academicYear = await AcademicYear.findOneAndUpdate(
    { college: collegeResult._id, name: '2026-2027' },
    { college: collegeResult._id, name: '2026-2027', startDate: new Date('2026-07-01'), endDate: new Date('2027-05-31'), isActive: true, isDemo: true },
    { new: true, upsert: true, runValidators: true }
  );
  summary.academicYears++;

  const courseSpecs = [
    ['BE-Computer Engineering', 'BE-COMP', 'COMP', 'Computer Engineering', 4, 8, 120],
    ['BE-Information Technology', 'BE-IT', 'IT', 'Information Technology', 4, 8, 120],
    ['BE-Electronics and Telecommunication', 'BE-ENTC', 'ENTC', 'Electronics and Telecommunication Engineering', 4, 8, 120],
    ['BE-Mechanical Engineering', 'BE-MECH', 'MECH', 'Mechanical Engineering', 4, 8, 120],
    ['BE-Civil Engineering', 'BE-CIVIL', 'CIVIL', 'Civil Engineering', 4, 8, 120],
    ['BE-AI and Data Science', 'BE-AIDS', 'AIDS', 'Artificial Intelligence and Data Science', 4, 8, 120]
  ];

  const courses = [];
  for (const [name, code, departmentCode, description, durationYears, semesterCount, intakeCapacity] of courseSpecs) {
    const department = departments.find(item => item.code === departmentCode);
    const course = await Course.findOneAndUpdate(
      { college: collegeResult._id, code },
      {
        college: collegeResult._id, department: department._id, name, code,
        durationYears, semesterCount, intakeCapacity, academicYear: '2026-2027',
        description: `Demo undergraduate course in ${description}.`,
        status: 'active', specializations: [], isDemo: true
      },
      { new: true, upsert: true, runValidators: true }
    );
    courses.push(course);
    summary.courses++;
  }

  for (const course of courses) {
    for (let number = 1; number <= 8; number++) {
      const semester = await Semester.findOneAndUpdate(
        { course: course._id, academicYear: academicYear._id, number },
        {
          college: collegeResult._id, course: course._id, academicYear: academicYear._id,
          number, name: `Semester ${number}`,
          startDate: number % 2 === 1 ? new Date('2026-07-01') : new Date('2027-01-01'),
          endDate: number % 2 === 1 ? new Date('2026-12-15') : new Date('2027-05-31'),
          isDemo: true
        },
        { new: true, upsert: true, runValidators: true }
      );
      summary.semesters++;

      const subjectName = number <= 2 ? `${course.name.replace('BE-', '')} Foundation ${number}` :
        `${course.name.replace('BE-', '')} Core ${number}`;
      await Subject.findOneAndUpdate(
        { college: collegeResult._id, code: `${course.code}-S${number}` },
        {
          college: collegeResult._id, department: course.department, course: course._id,
          semester: semester._id, name: subjectName, code: `${course.code}-S${number}`,
          credits: number % 2 === 0 ? 4 : 3, type: number % 3 === 0 ? 'practical' : 'theory',
          syllabus: 'Demo syllabus and learning outcomes.', isDemo: true
        },
        { upsert: true, runValidators: true }
      );
      summary.subjects++;
    }
  }

  const roleSpecs = [
    ['super_admin', 'Demo Super Admin', 'super.admin@example.com', null, null],
    ['college_admin', 'Demo College Admin', 'college.admin@example.com', null, null],
    ['librarian', 'Demo Librarian', 'librarian@example.com', null, null],
    ['accountant', 'Demo Accountant', 'accountant@example.com', null, null],
    ['placement_officer', 'Demo Placement Officer', 'placement.officer@example.com', null, null]
  ];
  for (const [role, name, email, college, department] of roleSpecs) {
    await upsertUser({
      name, email, role,
      college: college || collegeResult._id,
      department: department || null,
      permissions: role === 'super_admin' ? ['*'] : []
    });
  }

  const hodUsers = [];
  for (let index = 0; index < departments.length - 1; index++) {
    const department = departments[index];
    const hod = await upsertUser({
      name: department.hodName,
      email: department.hodEmail,
      role: index === 0 ? 'hod' : 'faculty',
      college: collegeResult._id,
      department: department._id,
      permissions: index === 0 ? ['department.view', 'department.manage', 'student.view'] : []
    });
    hodUsers.push(hod);
    await Department.updateOne({ _id: department._id }, { hod: hod._id });

    const employeeId = `WMIT-FAC-${String(index + 1).padStart(3, '0')}`;
    await FacultyProfile.findOneAndUpdate(
      { college: collegeResult._id, employeeId },
      {
        user: hod._id, college: collegeResult._id, department: department._id,
        employeeId, designation: index === 0 ? 'Professor and HOD' : 'Assistant Professor',
        qualification: 'M.E. / Ph.D. (Demo)', joiningDate: new Date('2023-07-01'),
        employmentStatus: 'active', isDemo: true
      },
      { upsert: true, runValidators: true }
    );
    summary.facultyProfiles++;
  }

  for (let index = 0; index < 12; index++) {
    const departmentIndex = index % courses.length;
    const course = courses[departmentIndex];
    const department = departments[departmentIndex];
    const prn = `DEMO-WMIT-${String(index + 1).padStart(4, '0')}`;
    const email = `student${index + 1}@example.com`;
    const student = await upsertUser({
      name: `Demo Student ${index + 1}`,
      email,
      role: 'student',
      college: collegeResult._id,
      department: department._id,
      permissions: ['student.profile', 'library.use']
    });
    await StudentProfile.findOneAndUpdate(
      { college: collegeResult._id, prn },
      {
        user: student._id, college: collegeResult._id, department: department._id,
        course: course._id, prn, rollNumber: `WMIT-${String(index + 1).padStart(3, '0')}`,
        academicYear: '2026-2027', semester: (index % 8) + 1,
        division: index % 2 === 0 ? 'A' : 'B', admissionDate: new Date('2026-07-01'),
        enrollmentStatus: 'active', phone: `+91-90000-${String(index).padStart(5, '0')}`,
        isDemo: true
      },
      { upsert: true, runValidators: true }
    );
    summary.studentProfiles++;
  }

  return summary;
}

async function main() {
  try {
    const result = await seed();
    console.log('Demo data seed completed');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) main();

module.exports = { seed };
