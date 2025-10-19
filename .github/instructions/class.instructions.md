Admin Dashboard – UML Class Diagram Guidelines

Purpose
Define class diagram standards for the admin dashboard subsystem. Focus on classes handling administrative operations while referencing shared domain entities.

General Principle

Dashboard classes manage approval, reporting, and administrative workflows.

Reference shared entities (User, Booking, Event) without redefining them.

Include controller and service classes unique to admin operations.

Diagram Rules

Shared entities appear as references only.

Define methods specific to admin functionality (e.g., approveBooking(), generateReport()).

Maintain UML conventions: visibility, associations, inheritance.

Avoid UI or implementation-specific details; focus on class responsibilities and interactions with shared entities.