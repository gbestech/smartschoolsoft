import React, { useState } from 'react';
import { Lifebuoy, BookOpen, MessageCircle, Mail, Phone, Search, ChevronRight, Home, User, FileText, Settings } from 'lucide-react';
import { LifeBuoy } from 'lucide-react';
const HelpSupport = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Help categories
    const helpCategories = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: Home,
            description: 'New user guide and basic setup',
            topics: [
                'Creating your first report',
                'User registration and login',
                'Navigating the dashboard',
                'Setting up your profile'
            ]
        },
        {
            id: 'reports',
            title: 'Reports & Analytics',
            icon: FileText,
            description: 'Creating and managing customer reports',
            topics: [
                'How to create a customer report',
                'Adding products to reports',
                'Report status and tracking',
                'Exporting report data'
            ]
        },
        {
            id: 'user-management',
            title: 'User Management',
            icon: User,
            description: 'Managing user accounts and permissions',
            topics: [
                'User roles and permissions',
                'Resetting passwords',
                'Managing user profiles',
                'Team collaboration'
            ]
        },
        {
            id: 'technical',
            title: 'Technical Support',
            icon: Settings,
            description: 'Technical issues and troubleshooting',
            topics: [
                'Browser compatibility',
                'API integration issues',
                'Performance problems',
                'Mobile app support'
            ]
        }
    ];

    // Common issues
    const commonIssues = [
        {
            question: "Why can't I submit a report?",
            answer: "Check if all required fields are filled and you have an active internet connection."
        },
        {
            question: "How do I reset my password?",
            answer: "Go to Settings > Account Security > Reset Password. A reset link will be sent to your email."
        },
        {
            question: "Why are my products not loading?",
            answer: "This could be due to server issues. Try refreshing the page or check your network connection."
        },
        {
            question: "How do I export my reports?",
            answer: "Navigate to Reports > Export and select your preferred format (PDF, Excel, CSV)."
        }
    ];

    // Contact methods
    const contactMethods = [
        {
            icon: Mail,
            title: 'Email Support',
            description: 'Get help via email',
            details: 'support@yourcompany.com',
            responseTime: 'Within 24 hours'
        },
        {
            icon: Phone,
            title: 'Phone Support',
            description: 'Speak directly with our team',
            details: '+1 (555) 123-4567',
            responseTime: 'Mon-Fri, 9AM-6PM EST'
        },
        {
            icon: MessageCircle,
            title: 'Live Chat',
            description: 'Instant messaging support',
            details: 'Available on dashboard',
            responseTime: 'Real-time during business hours'
        }
    ];

    const filteredCategories = helpCategories.filter(category =>
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <LifeBuoy className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Help & Support
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Find answers to common questions, browse documentation, or get in touch with our support team.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search for help articles, topics, or issues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-shadow">
                        <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Knowledge Base</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Browse our comprehensive documentation and guides
                        </p>
                        <button
                            onClick={() => setActiveSection('knowledge-base')}
                            className="text-blue-600 text-sm font-medium hover:text-blue-700"
                        >
                            View Articles
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-shadow">
                        <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Common Issues</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Quick solutions to frequently asked questions
                        </p>
                        <button
                            onClick={() => setActiveSection('common-issues')}
                            className="text-green-600 text-sm font-medium hover:text-green-700"
                        >
                            View Solutions
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-shadow">
                        <Mail className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Get personalized help from our support team
                        </p>
                        <button
                            onClick={() => setActiveSection('contact')}
                            className="text-purple-600 text-sm font-medium hover:text-purple-700"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {/* Navigation Tabs */}
                    <div className="border-b">
                        <nav className="flex overflow-x-auto">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'knowledge-base', label: 'Knowledge Base' },
                                { id: 'common-issues', label: 'Common Issues' },
                                { id: 'contact', label: 'Contact Support' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id)}
                                    className={`flex-shrink-0 px-6 py-4 border-b-2 font-medium text-sm ${activeSection === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Sections */}
                    <div className="p-6">
                        {/* Overview Section */}
                        {activeSection === 'overview' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Help Categories</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredCategories.map((category) => (
                                        <div key={category.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start mb-4">
                                                <category.icon className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                                                    <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                                                </div>
                                            </div>
                                            <ul className="space-y-2">
                                                {category.topics.map((topic, index) => (
                                                    <li key={index} className="flex items-center text-sm text-gray-600">
                                                        <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                                                        {topic}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Knowledge Base Section */}
                        {activeSection === 'knowledge-base' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Knowledge Base</h2>
                                <div className="space-y-6">
                                    {helpCategories.map((category) => (
                                        <div key={category.id} className="border rounded-lg p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <category.icon className="h-5 w-5 text-blue-600 mr-2" />
                                                {category.title}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {category.topics.map((topic, index) => (
                                                    <button
                                                        key={index}
                                                        className="text-left p-3 rounded border hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="font-medium text-gray-900 mb-1">{topic}</div>
                                                        <div className="text-sm text-gray-600">Learn more about {topic.toLowerCase()}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Common Issues Section */}
                        {activeSection === 'common-issues' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Issues & Solutions</h2>
                                <div className="space-y-4">
                                    {commonIssues.map((issue, index) => (
                                        <div key={index} className="border rounded-lg p-6">
                                            <h3 className="font-semibold text-gray-900 mb-3">{issue.question}</h3>
                                            <p className="text-gray-600">{issue.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact Support Section */}
                        {activeSection === 'contact' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {contactMethods.map((method, index) => (
                                        <div key={index} className="border rounded-lg p-6 text-center">
                                            <method.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                                            <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                                            <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                                            <div className="text-gray-900 font-medium mb-2">{method.details}</div>
                                            <div className="text-sm text-gray-500">Response: {method.responseTime}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Contact Form */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a message</h3>
                                    <form className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Your Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="What do you need help with?"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Message
                                            </label>
                                            <textarea
                                                rows="4"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Please describe your issue in detail..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Send Message
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Help Text */}
                <div className="text-center mt-8">
                    <p className="text-gray-600 text-sm">
                        Can't find what you're looking for?{' '}
                        <button
                            onClick={() => setActiveSection('contact')}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Contact our support team
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;