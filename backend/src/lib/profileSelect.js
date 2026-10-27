// The only user fields that are ever sent to the browser.
// passwordHash is deliberately NOT here.
module.exports = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,

    // shared profile fields
    phone: true,
    address: true,
    avatarUrl: true,

    // student fields
    studentCode: true,
    institute: true,
    targetExam: true,
    dateOfBirth: true,

    // teacher fields
    designation: true,
    subject: true,
    qualification: true,
    bio: true,
};