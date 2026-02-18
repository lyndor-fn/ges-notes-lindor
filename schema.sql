-- Database Schema for Grade Tracker
-- Compatible with MySQL

CREATE DATABASE IF NOT EXISTS grade_tracker;
USE grade_tracker;

-- Semesters table
CREATE TABLE IF NOT EXISTS semesters (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Classes table (Groups of modules, e.g., "Maths", "Science")
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(36) PRIMARY KEY,
    semester_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modules table (Individual subjects with grades)
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    assignment_grade DECIMAL(5,2) DEFAULT NULL,
    exam_grade DECIMAL(5,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example Query to calculate weighted average per module:
-- SELECT name, (assignment_grade * 0.6 + exam_grade * 0.4) as average FROM modules;

-- Example Query to calculate class average:
-- SELECT c.name, AVG(m.assignment_grade * 0.6 + m.exam_grade * 0.4) as class_avg
-- FROM classes c
-- JOIN modules m ON c.id = m.class_id
-- GROUP BY c.id;