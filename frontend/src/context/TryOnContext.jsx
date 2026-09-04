// FILE: frontend/src/context/TryOnContext.jsx
import React, { createContext, useContext, useState } from 'react';

const TryOnContext = createContext(null);

export function TryOnProvider({ children }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [capturedImages, setCapturedImages] = useState({
    front: null
  });

  const [userMeasurements, setUserMeasurements] = useState({
    chestCm: 108,
    shoulderCm: 46,
    waistCm: 92,
    heightCm: 178,
    weightKg: 76,
    userSize: 'L'
  });

  const [tryOnResult, setTryOnResult] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeStep, setActiveStep] = useState(1);

  const selectProductForTryOn = (product) => {
    setSelectedProduct(product);
    setTryOnResult(null);
  };

  const updateCapturedAngle = (angleKey, imageSrc) => {
    setCapturedImages((prev) => ({
      ...prev,
      [angleKey]: imageSrc
    }));
  };

  const updateUserMeasurements = (newMeasurements) => {
    setUserMeasurements((prev) => ({
      ...prev,
      ...newMeasurements
    }));
  };

  const clearCapturedImages = () => {
    setCapturedImages({
      front: null
    });
  };

  const addToCart = (product, selectedSize = 'L') => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            selectedSize,
            quantity: 1
          }
        ];
      }
    });
  };

  const removeFromCart = (id, size) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.selectedSize === size)));
  };

  const clearCart = () => setCart([]);

  return (
    <TryOnContext.Provider
      value={{
        selectedProduct,
        setSelectedProduct,
        selectProductForTryOn,
        capturedImages,
        updateCapturedAngle,
        clearCapturedImages,
        userMeasurements,
        updateUserMeasurements,
        tryOnResult,
        setTryOnResult,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        activeStep,
        setActiveStep
      }}
    >
      {children}
    </TryOnContext.Provider>
  );
}

export function useTryOn() {
  const context = useContext(TryOnContext);
  if (!context) {
    throw new Error('useTryOn must be used within a TryOnProvider');
  }
  return context;
}
