import AddReminderForm from "@/components/AddReminderForm";
import ReminderCard from "@/components/ReminderCard";
import { Reminder } from "@/hooks/useFirebaseReminders";
import { ReminderFilterType } from "./Main";

interface RemindersProps {
  reminders: Reminder[];
  addReminder: (time: { type: "recurring" | "schedule"; value: string; interval?: number; days?: number[]; name?: string; repeatMode?: "once" | "daily" | "weekly"; intentType?: "break-distraction" | "stay-productive" } | string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  loading: boolean;
  reminderTypeFilter: ReminderFilterType;
  onReminderTypeFilterChange: (type: ReminderFilterType) => void;
}

const Reminders = ({ reminders, addReminder, deleteReminder, loading, reminderTypeFilter, onReminderTypeFilterChange }: RemindersProps) => {

  // Filter reminders based on selected type
  const filteredReminders = reminders.filter(reminder => reminder.type === reminderTypeFilter);
  const remindersTitle = reminderTypeFilter === "recurring" ? "Recurring POPs" : "Scheduled POPs";

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-300 via-yellow-200 to-yellow-200 overflow-hidden">
      {/* Main Content */}
      <section className="relative z-10 py-2">
        <div className="w-full max-w-md mx-auto space-y-5">
          {/* Section Header */}
          <div>
            <h2 className="text-4xl font-black text-black mb-2">
              Create a Self POP
            </h2>
            <p className="text-black/75 font-medium">
              Set times to receive meaningful questions
            </p>
          </div>

          {/* Add Reminder Form */}
          <div className="bg-yellow-100 rounded-2xl border border-black/15 p-6 shadow-sm">
              <AddReminderForm 
                onReminderTypeChange={onReminderTypeFilterChange}
                onAdd={(time) => {
                if (typeof time === "string") {
                  addReminder({ type: "schedule", value: time });
                } else {
                  addReminder(time);
                }
              }} />
            </div>

          {/* Reminders List Section */}
          <div>
            <h3 className="text-3xl font-black text-black mb-4 flex items-center gap-3">
              {remindersTitle}
              {filteredReminders.length > 0 && (
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-black text-yellow-300 text-sm font-bold">
                  {filteredReminders.length}
                </span>
              )}
            </h3>

            {loading ? (
              <div className="bg-yellow-100 rounded-2xl border border-black/15 p-8 text-center shadow-sm">
                <p className="text-black font-black text-lg">Loading reminders...</p>
              </div>
            ) : filteredReminders.length === 0 ? (
              <div className="bg-yellow-100 rounded-2xl border border-black/15 p-8 text-center shadow-sm">
                <p className="text-black font-black text-lg">
                  No {reminderTypeFilter} reminders yet
                </p>
                <p className="text-black/50 font-semibold mt-2 text-sm">
                  Create your first {reminderTypeFilter} reminder above
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReminders.map((reminder) => (
                  <div key={reminder.id} className="bg-yellow-100 rounded-2xl border border-black/15 p-5 shadow-sm">
                    <ReminderCard
                      reminder={reminder}
                      onDelete={deleteReminder}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reminders;
