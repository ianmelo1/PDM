import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet(['token', 'user']);
        if (storedToken[1]) setToken(storedToken[1]);
        if (storedUser[1]) setUser(JSON.parse(storedUser[1]));
      } finally {
        setAuthLoading(false);
      }
    }
    restoreSession();
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, txs] = await Promise.all([
        api.listCategories(),
        api.listTransactions(),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch (e) {
      setError(e.message ?? 'Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data) => {
    const result = await api.login(data);
    await AsyncStorage.setItem('token', result.token);
    await AsyncStorage.setItem('user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result;
  }, []);

  const register = useCallback(async (data) => {
    const result = await api.register(data);
    await AsyncStorage.setItem('token', result.token);
    await AsyncStorage.setItem('user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
    setTransactions([]);
    setCategories([]);
  }, []);

  const addTransaction = useCallback(async (data) => {
    const tx = await api.createTransaction(data);
    setTransactions(prev => [tx, ...prev]);
    return tx;
  }, []);

  const updateTransaction = useCallback(async (id, data) => {
    const tx = await api.updateTransaction(id, data);
    setTransactions(prev => prev.map(t => (t.id === id ? tx : t)));
    return tx;
  }, []);

  const removeTransaction = useCallback(async (id) => {
    await api.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addCategory = useCallback(async (data) => {
    const cat = await api.createCategory(data);
    setCategories(prev => [...prev, cat].sort((a, b) => a.displayName.localeCompare(b.displayName)));
    return cat;
  }, []);

  const removeCategory = useCallback(async (id) => {
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <GlobalContext.Provider value={{
      user, token, authLoading,
      transactions, categories,
      loading, error,
      refresh, login, register, logout,
      addTransaction, updateTransaction, removeTransaction,
      addCategory, removeCategory,
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  return useContext(GlobalContext);
}
