import React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";

import { ChevronLeft, ChevronRight } from "lucide-react";

const Calendar = (props: DayPickerProps) => {
  return (
    <DayPicker
      className="p-4"
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4 text-indigo-400" />;
          }
          return <ChevronRight className="h-4 w-4 text-indigo-400" />;
        },
      }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-2 relative items-center mb-4 h-8",
        caption_label: "text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400",
        nav: "absolute left-0 right-0 flex justify-between items-center pointer-events-none px-0.5",
        button_previous: "h-7 w-7 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center opacity-70 hover:opacity-100 transition-all pointer-events-auto absolute left-0.5",
        button_next: "h-7 w-7 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center opacity-70 hover:opacity-100 transition-all pointer-events-auto absolute right-0.5",
        month_grid: "mx-auto",
        table: "border-collapse space-y-1 mx-auto",
        head_row: "flex justify-center",
        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]",
        row: "flex mt-2 justify-center",
        cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-xs",
        day_selected: "bg-indigo-600 text-white hover:bg-indigo-500 focus:bg-indigo-500",
        day_today: "bg-slate-800 text-indigo-400 font-bold",
        day_outside: "text-slate-600 opacity-50",
        day_disabled: "text-slate-600 opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...props.classNames,
      }}
      {...props}
    />
  );
};

export default Calendar;
