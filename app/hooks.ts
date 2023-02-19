import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "./redux/Store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;