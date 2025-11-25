// import React, { useState } from 'react';
// import { House1 } from '../types/types';
// import axios from 'axios';

// const CreateBuilding = () => {
  
//   const [building, setBuilding] = useState<House1[]>([]);

//   const handleSubmit = async (e: { preventDefault: () => void; }) => {
//     e.preventDefault();
    
//     const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) {
//       newErrors.name = 'Name is required';
//     }
    
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }
    
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }
    
//     return newErrors;
//   };

//     try {
//       const response = await axios.post('https://localhost:7207/api/building', building, {
//         headers: {
//           'Content-Type': 'application/json',
//           //'Authorization': 'Bearer your-token' // if needed
//         }
//       });
      
//       console.log('Building created:', response.data);
//       // Reset form or handle success
      
//     } catch (error) {
//       console.error('Error creating product:', error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       {/* Form fields similar to above example */}
//     </form>
//   );
// };