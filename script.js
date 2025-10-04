// DOM Elements
const authContainer = document.getElementById('auth-container');
const portalContainer = document.getElementById('portal-container');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const welcomeMessage = document.getElementById('welcome-message');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const themeButtons = document.querySelectorAll('.theme-btn');

// User data storage
let users = JSON.parse(localStorage.getItem('students')) || [];
let currentUser = null;

// Tab switching
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
});

signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
});

// Sign Up Functionality
signupBtn.addEventListener('click', () => {
    const name = document.getElementById('signup-name').value.trim();
    const studentNumber = document.getElementById('signup-student-number').value.trim();
    const course = document.getElementById('signup-course').value;
    const year = document.getElementById('signup-year').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Reset error messages
    resetErrorMessages('signup');

    let hasError = false;

    // Validation
    if (!name) {
        showError('signup-name-error', 'Name is required');
        hasError = true;
    }

    if (!studentNumber) {
        showError('signup-student-number-error', 'Student number is required');
        hasError = true;
    }

    if (!course) {
        showError('signup-course-error', 'Course is required');
        hasError = true;
    }

    if (!year) {
        showError('signup-year-error', 'Year is required');
        hasError = true;
    }

    if (!password) {
        showError('signup-password-error', 'Password is required');
        hasError = true;
    } else if (password.length < 6) {
        showError('signup-password-error', 'Password must be at least 6 characters');
        hasError = true;
    }

    if (!confirmPassword) {
        showError('signup-confirm-password-error', 'Please confirm your password');
        hasError = true;
    } else if (password !== confirmPassword) {
        showError('signup-confirm-password-error', 'Passwords do not match');
        hasError = true;
    }

    // Check if student number already exists
    if (users.find(user => user.studentNumber === studentNumber)) {
        showError('signup-student-number-error', 'Student number already exists');
        hasError = true;
    }

    if (!hasError) {
        // Create new user
        const newUser = {
            name,
            studentNumber,
            course,
            year,
            password
        };

        users.push(newUser);
        localStorage.setItem('students', JSON.stringify(users));

        // Switch to login form
        loginTab.click();
        
        // Clear form
        document.getElementById('signup-form').reset();
        
        alert('Registration successful! Please login.');
    }
});

// Login Functionality
loginBtn.addEventListener('click', () => {
    const name = document.getElementById('login-name').value.trim();
    const password = document.getElementById('login-password').value;

    // Reset error messages
    resetErrorMessages('login');

    let hasError = false;

    // Validation
    if (!name) {
        showError('login-name-error', 'Name is required');
        hasError = true;
    }

    if (!password) {
        showError('login-password-error', 'Password is required');
        hasError = true;
    }

    if (!hasError) {
        // Find user
        const user = users.find(u => u.name === name && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentStudent', JSON.stringify(currentUser));
            showPortal();
        } else {
            showError('login-password-error', 'Invalid name or password');
        }
    }
});

// Logout Functionality
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentStudent');
    showAuth();
});

// Navigation
navItems.forEach(item => {
    if (item.id !== 'logout-btn') {
        item.addEventListener('click', () => {
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked nav item
            item.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Show the corresponding content section
            const sectionId = item.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.add('active');
            
            // Load data for the section if needed
            if (sectionId === 'schedule-section') {
                loadScheduleData();
            } else if (sectionId === 'grades-section') {
                loadGradesData();
            } else if (sectionId === 'records-section') {
                loadRecordsData();
            } else if (sectionId === 'ledger-section') {
                loadLedgerData();
            }
        });
    }
});

// Theme Switching
themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const theme = button.getAttribute('data-theme');
        
        // Remove active class from all theme buttons
        themeButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked theme button
        button.classList.add('active');
        
        // Remove all theme classes from body
        document.body.classList.remove('dark-theme', 'cool-theme');
        
        // Add the selected theme class
        if (theme !== 'light') {
            document.body.classList.add(theme + '-theme');
        }
        
        // Save theme preference
        localStorage.setItem('theme', theme);
    });
});

// Helper Functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function resetErrorMessages(formType) {
    const errorElements = document.querySelectorAll(`#${formType}-form .error-message`);
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
}

function showPortal() {
    authContainer.style.display = 'none';
    portalContainer.style.display = 'block';
    
    // Update welcome message
    welcomeMessage.textContent = `Welcome to Your Portal, ${currentUser.name}!`;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`).click();
    
    // Load initial data
    loadScheduleData();
}

function showAuth() {
    authContainer.style.display = 'flex';
    portalContainer.style.display = 'none';
    
    // Reset login form
    document.getElementById('login-form').reset();
    resetErrorMessages('login');
}

// Data Loading Functions
function loadScheduleData() {
    const scheduleBody = document.getElementById('schedule-body');
    
    // Sample schedule data
    const scheduleData = [
        { code: 'CS101', name: 'Introduction to Programming', day: 'Monday', time: '9:00-10:30', room: 'Room 101', instructor: 'Dr. Smith' },
        { code: 'MATH201', name: 'Calculus I', day: 'Tuesday', time: '11:00-12:30', room: 'Room 205', instructor: 'Prof. Johnson' },
        { code: 'ENG102', name: 'English Composition', day: 'Wednesday', time: '2:00-3:30', room: 'Room 110', instructor: 'Dr. Williams' },
        { code: 'PHY150', name: 'Physics Fundamentals', day: 'Thursday', time: '10:00-11:30', room: 'Lab 3', instructor: 'Prof. Brown' },
        { code: 'HIST101', name: 'World History', day: 'Friday', time: '1:00-2:30', room: 'Room 305', instructor: 'Dr. Davis' }
    ];
    
    scheduleBody.innerHTML = '';
    scheduleData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.day}</td>
            <td>${item.time}</td>
            <td>${item.room}</td>
            <td>${item.instructor}</td>
        `;
        scheduleBody.appendChild(row);
    });
}

function loadGradesData() {
    const gradesBody = document.getElementById('grades-body');
    
    // Sample grades data with college grading system (1.0-5.0)
    const gradesData = [
        { code: 'CS101', name: 'Introduction to Programming', prelim: '1.5', midterm: '1.25', final: '1.0', overall: '1.25', remarks: 'Passed!' },
        { code: 'MATH201', name: 'Calculus I', prelim: '2.0', midterm: '1.75', final: '1.5', overall: '1.75', remarks: 'Passed!' },
        { code: 'ENG102', name: 'English Composition', prelim: '1.25', midterm: '1.0', final: '1.25', overall: '1.17', remarks: 'Passed!' },
        { code: 'PHY150', name: 'Physics Fundamentals', prelim: '2.5', midterm: '2.25', final: '2.0', overall: '2.25', remarks: 'Passed!' },
        { code: 'HIST101', name: 'World History', prelim: '5.0', midterm: '5.0', final: '5.0', overall: '5.0', remarks: 'Failed!' }
    ];
    
    gradesBody.innerHTML = '';
    gradesData.forEach(item => {
        const row = document.createElement('tr');
        const gradeClass = getGradeClass(item.overall);
        row.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td class="${gradeClass}">${item.prelim}</td>
            <td class="${gradeClass}">${item.midterm}</td>
            <td class="${gradeClass}">${item.final}</td>
            <td class="${gradeClass}">${item.overall}</td>
            <td>${item.remarks}</td>
        `;
        gradesBody.appendChild(row);
    });
}

function getGradeClass(grade) {
    const numGrade = parseFloat(grade);
    if (numGrade <= 1.5) return 'grade-excellent';
    if (numGrade <= 2.0) return 'grade-good';
    if (numGrade <= 2.5) return 'grade-average';
    return 'grade-poor';
}

function loadRecordsData() {
    const studentInfo = document.getElementById('student-info');
    const recordsBody = document.getElementById('records-body');
    
    // Update student information
    studentInfo.innerHTML = `
        <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">${currentUser.name}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Student Number:</span>
            <span class="info-value">${currentUser.studentNumber}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Course:</span>
            <span class="info-value">${currentUser.course}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Year:</span>
            <span class="info-value">${currentUser.year}</span>
        </div>
    `;
    
    // Sample records data
    const recordsData = [
        { academicYear: '2022-2023', year: '1st', semester: 'First', status: 'Regular', units: '18', gpa: '1.45' },
        { academicYear: '2022-2023', year: '1st', semester: 'Second', status:'Regular', units: '18', gpa: '1.38' },
        { academicYear: '2022-2023', year: '1st', semester: 'Third', status: 'Regular', units: '18', gpa: '1.52' },
        { academicYear: '2022-2023', year: '2nd', semester: 'First', status: 'Regular', units: '18', gpa: '2.25' }
    ];
    
    recordsBody.innerHTML = '';
    recordsData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.academicYear}</td>
            <td>${item.year}</td>
            <td>${item.semester}</td>
            <td>${item.status}</td>
            <td>${item.units}</td>
            <td>${item.gpa}</td>
        `;
        recordsBody.appendChild(row);
    });
}

function loadLedgerData() {
    const ledgerBody = document.getElementById('ledger-body');
    const totalAmountElement = document.getElementById('total-amount');
    const amountPaidElement = document.getElementById('amount-paid');
    const balanceElement = document.getElementById('balance');
    
    // Sample ledger data
    const ledgerData = [
        { date: '2023-08-15', description: 'Tuition Fee - Down Payment', amount: '₱5,000.00', status: 'Paid' },
        { date: '2023-09-01', description: 'Tuition Fee - 1st Installment', amount: '₱5,000.00', status: 'Paid' },
        { date: '2023-10-01', description: 'Tuition Fee - 2nd Installment', amount: '₱5,000.00', status: 'Paid' },
        { date: '2023-10-01', description: 'Tuition Fee - 2nd Installment', amount: '₱5,000.00', status: 'Paid' },
        { date: '2023-11-01', description: 'Tuition Fee - 3rd Installment', amount: '₱5,000.00', status: 'Outstanding Balance' },
    ];
    
    // Calculate totals
    const totalAmount = 25000;
    let amountPaid = 0;
    
    ledgerData.forEach(item => {
        if (item.status === 'Paid') {
            amountPaid += 5000;
        }
    });
    
    const balance = totalAmount - amountPaid;
    
    // Update summary
    totalAmountElement.textContent = `₱${totalAmount.toLocaleString()}`;
    amountPaidElement.textContent = `₱${amountPaid.toLocaleString()}`;
    balanceElement.textContent = `₱${balance.toLocaleString()}`
    
    // Update ledger table
    ledgerBody.innerHTML = '';
    ledgerData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.description}</td>
            <td>${item.amount}</td>
            <td class="${item.status === 'Paid' ? 'status-paid' : 'status-outstanding'}">${item.status}</td>
        `;
        ledgerBody.appendChild(row);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentStudent');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showPortal();
    }
});