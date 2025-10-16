// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';

// const Login = () => {
//     const [formData, setFormData] = useState({
//         username: '',
//         password: ''
//     });
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const { login } = useAuth();
//     const navigate = useNavigate();

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         const result = await login(formData.username, formData.password);

//         if (result.success) {
//             navigate('/dashboard');
//         } else {
//             setError(result.error.detail || 'Login failed. Please check your credentials.');
//         }

//         setLoading(false);
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//             <div className="w-full max-w-md">
//                 <div className="bg-white rounded-2xl shadow-xl p-8">
//                     <div className="text-center mb-8">
//                         <div className="flex items-center justify-center mb-4">
//                             <span className="text-3xl mr-3">🔐</span>
//                             <h2 className="text-2xl font-bold text-gray-900">Login</h2>
//                         </div>
//                         <p className="text-gray-600">Sign in to your account</p>
//                     </div>

//                     {error && (
//                         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
//                             <span className="text-red-500 mr-3">⚠️</span>
//                             <span className="text-red-700 text-sm">{error}</span>
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         <div>
//                             <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
//                                 Username
//                             </label>
//                             <div className="relative">
//                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                     <span className="text-gray-400">👤</span>
//                                 </div>
//                                 <input
//                                     type="text"
//                                     id="username"
//                                     name="username"
//                                     value={formData.username}
//                                     onChange={handleChange}
//                                     required
//                                     placeholder="Enter your username"
//                                     className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                                 Password
//                             </label>
//                             <div className="relative">
//                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                     <span className="text-gray-400">🔒</span>
//                                 </div>
//                                 <input
//                                     type="password"
//                                     id="password"
//                                     name="password"
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     required
//                                     placeholder="Enter your password"
//                                     className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                                 />
//                             </div>
//                         </div>

//                         <div className="flex items-center justify-between">
//                             <label className="flex items-center">
//                                 <input
//                                     type="checkbox"
//                                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                                 />
//                                 <span className="ml-2 text-sm text-gray-600">Remember me</span>
//                             </label>
//                             <a href="#forgot" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
//                                 Forgot password?
//                             </a>
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                         >
//                             {loading ? (
//                                 <>
//                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                     Signing in...
//                                 </>
//                             ) : (
//                                 'Sign In'
//                             )}
//                         </button>
//                     </form>

//                     <div className="mt-8 text-center">
//                         <p className="text-gray-600">
//                             Don't have an account?{' '}
//                             <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
//                                 Create an account
//                             </Link>
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Login;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.username, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error.detail || 'Login failed. Please check your credentials.');
        }

        setLoading(false);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-95">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <span className="text-3xl mr-3">🔐</span>
                            <h2 className="text-2xl font-bold text-gray-900">Login</h2>
                        </div>
                        <p className="text-gray-600">Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                            <span className="text-red-500 mr-3">⚠️</span>
                            <span className="text-red-700 text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">👤</span>
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your username"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">🔒</span>
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your password"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                            <a href="#forgot" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;