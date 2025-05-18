const events = [
    {
        id: 1,
        eventName: "Summer Music Festival",
        eventDate: new Date("2023-12-15"),
        eventTime: "16:00",
        description: "Biggest festival of the year!",
        venue: { name: "Central Park", location: { city: "New York" }, capacity: 5000 },
        artists: [
            { name: "The Weeknd", bio: "Canadian singer.", imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad" },
            { name: "Billie Eilish", bio: "American artist.", imageUrl: "https://images.unsplash.com/photo-1499415479124-43c32433a620" }
        ],
        genres: ["Pop", "Hip Hop/Rap"],
        ticketTypes: [
            { name: "General Admission", price: 79.99, available: 1000, total: 1000 },
            { name: "VIP Experience", price: 199.99, available: 200, total: 200 },
            { name: "Early Bird", price: 59.99, available: 50, total: 50 }
        ],
        images: ["https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3"],
        ageRestriction: "All Ages",
        isActive: true
    },
    {
        id: 2,
        eventName: "Rock the City",
        eventDate: new Date("2023-12-10"),
        eventTime: "20:00",
        description: "Rock concert extravaganza.",
        venue: { name: "Madison Square Garden", location: { city: "New York" }, capacity: 20000 },
        artists: [{ name: "Foo Fighters", bio: "Rock legends.", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f" }],
        genres: ["Rock"],
        ticketTypes: [
            { name: "General Admission", price: 49.99, available: 5000, total: 5000 }
        ],
        images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f"],
        ageRestriction: "18+",
        isActive: true
    }
];

let orders = [];