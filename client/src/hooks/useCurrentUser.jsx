import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading } from "../store/slices/authSlice";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const useCurrentUser = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchUser = async () => {
      dispatch(setLoading(true));
      try {
        const res = await api.get("/api/auth/currentUser");
        dispatch(setUser(res.data.user));
      } catch {
        dispatch(setLoading(false));
      }
    };

    fetchUser();
  }, []);

  return { user, isAuthenticated, loading };
};

export default useCurrentUser;