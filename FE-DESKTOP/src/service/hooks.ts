import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

// Use these instead of the normal useDispatch and useSelector if IDE complains about unknown types.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
