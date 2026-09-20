import React, { createContext, useContext, useState } from 'react';

const TryOnContext = createContext(null);

export function TryOnProvider({ children }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [capturedImages, setCapturedImages] = useState({
    front: null,
    userId: null
  });

  const [userMeasurements, setUserMeasurements] = useState({
    chestCm: 108,
    shoulderCm: 46,
    waistCm: 92,
    heightCm: 178,
    weightKg: 76,
    userSize: 'L',
    userId: null
  });

  const [tryOnResult, setTryOnResult] = useState(null);
  const [resultCache, setResultCache] = useState({}); // Local cache for exact person+garment combos
  const [cart, setCart] = useState([]);
  const [activeStep, setActiveStep] = useState(1);

  const selectProductForTryOn = (product) => {
    setSelectedProduct(product);
  };

  const updateCapturedAngle = (angleKey, imageSrc, userId = null) => {
    setCapturedImages((prev) => ({
      ...prev,
      [angleKey]: imageSrc,
      userId: userId || prev.userId
    }));
  };

  const updateUserMeasurements = (newMeasurements, userId = null) => {
    setUserMeasurements((prev) => ({
      ...prev,
      ...newMeasurements,
      userId: userId || prev.userId
    }));
  };

  const tagCapturedDataWithUser = (userId) => {
    if (!userId) return;
    setCapturedImages((prev) => ({ ...prev, userId }));
    setUserMeasurements((prev) => ({ ...prev, userId }));
    setTryOnResult((prev) => (prev ? { ...prev, userId } : null));
  };

  const clearCapturedImages = () => {
    setCapturedImages({
      front: null,
      userId: null
    });
  };

  /**
   * Helper to retrieve or store cached try-on output
   */
  const getCachedTryOnResult = (personSrc, garmentSrc) => {
    if (!personSrc || !garmentSrc) return null;
    const key = `${personSrc.length}_${garmentSrc}`;
    return resultCache[key] || null;
  };

  const setCachedTryOnResult = (personSrc, garmentSrc, result) => {
    if (!personSrc || !garmentSrc || !result) return;
    const key = `${personSrc.length}_${garmentSrc}`;
    setResultCache((prev) => ({ ...prev, [key]: result }));
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
        tagCapturedDataWithUser,
        tryOnResult,
        setTryOnResult,
        getCachedTryOnResult,
        setCachedTryOnResult,
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
