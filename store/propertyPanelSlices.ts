import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PayloadData {
  selectedPanel: string;
}

const initialState = {
  selectedPanel: "localization",
};

const propertyPanelSlice = createSlice({
  name: "PropertyPanel",
  initialState: initialState,
  reducers: {
    selectPanel(state, action: PayloadAction<PayloadData>) {
      state.selectedPanel = action.payload.selectedPanel;
    },
  },
});

export const { selectPanel } = propertyPanelSlice.actions;
export default propertyPanelSlice.reducer;
