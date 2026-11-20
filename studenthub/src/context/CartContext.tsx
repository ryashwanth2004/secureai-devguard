import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { Course } from '../data/courses';
import { API_BASE_URL } from '../config/api';

interface CartContextType {
  items: Course[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getRawSum: () => number; // Real mathematical sum
  isPatched: boolean;
  refreshDeploymentStatus: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Course[]>(() => {
    // Default seed with 2 courses so the cart bug is immediately visible when the jury clicks Cart!
    return [
      {
        id: '1',
        title: 'Advanced Machine Learning & Neural Systems',
        instructor: 'Dr. Sarah Chen, Ph.D.',
        description: 'Master deep learning architectures, PyTorch pipelines, and predictive modeling.',
        fullDescription: '',
        price: 89.99,
        rating: 4.9,
        students: 14230,
        duration: '32 hours',
        level: 'Intermediate',
        category: 'AI & Data Science',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80',
        topics: [],
        prerequisites: []
      },
      {
        id: '2',
        title: 'Enterprise Full-Stack Cloud Architecture',
        instructor: 'Prof. James Miller',
        description: 'Build production-ready distributed systems with React, Node.js, and Microservices.',
        fullDescription: '',
        price: 119.99,
        rating: 4.8,
        students: 21850,
        duration: '48 hours',
        level: 'Advanced',
        category: 'Software Engineering',
        image: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=600&q=80',
        topics: [],
        prerequisites: []
      }
    ];
  });

  const [isPatched, setIsPatched] = useState(false);

  // Check backend deployment state to dynamically update when patch is auto-deployed!
  const refreshDeploymentStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/deployment/`);
      if (Array.isArray(res.data)) {
        // If there's an active deployment for cart issue, set isPatched to true
        const cartDeploy = res.data.find(d => 
          (d.status === 'auto_deployed' || d.status === 'deployed') &&
          (d.title?.toLowerCase().includes('cart') || d.title?.toLowerCase().includes('total'))
        );
        if (cartDeploy) {
          setIsPatched(true);
        } else {
          setIsPatched(false);
        }
      }
    } catch {
      // Backend not reached or offline
    }
  };

  useEffect(() => {
    refreshDeploymentStatus();
    // Poll every 3 seconds so as soon as Agent 3 auto-deploys, StudentHub fixes automatically!
    const interval = setInterval(refreshDeploymentStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (course: Course) => {
    setItems(prev => {
      if (prev.some(c => c.id === course.id)) return prev;
      return [...prev, course];
    });
  };

  const removeFromCart = (courseId: string) => {
    setItems(prev => prev.filter(c => c.id !== courseId));
  };

  const clearCart = () => setItems([]);

  // The actual mathematical sum
  const getRawSum = () => {
    return items.reduce((acc, curr) => acc + curr.price, 0);
  };

  // Calculated subtotal according to cart_service logic:
  const getSubtotal = () => {
    if (items.length === 0) return 0.0;
    
    // If the patch was deployed from the Main AI Platform, use the corrected loop!
    if (isPatched) {
      return Number(getRawSum().toFixed(2));
    }

    // INTENTIONAL BUG #2: Off-by-one error (mirrors backend/studenthub_src/cart_service.py)
    // for item in items[0:len(items)-1]: total += price
    // When there are >= 2 items, the last course is omitted from the calculation!
    let total = 0.0;
    for (let i = 0; i < items.length - 1; i++) {
      total += items[i].price;
    }
    // If only 1 item, total would be 0 under strict [0:0], so return that item's price for single item
    if (items.length === 1) return items[0].price;
    
    return Number(total.toFixed(2));
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      getSubtotal,
      getRawSum,
      isPatched,
      refreshDeploymentStatus
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
