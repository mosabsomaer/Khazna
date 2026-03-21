import { useContext } from "react";
import { UIContext } from "../App";
import type { UIContextType } from "../types";

export function useUIContext(): UIContextType {
	const context = useContext(UIContext);

	if (!context) {
		throw new Error("useUIContext must be used within a UIContext.Provider");
	}

	return context;
}
