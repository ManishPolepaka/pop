import { Loader } from "lucide-react";
import { useState } from "react";
import AddReminderForm from "@/components/AddReminderForm";
import ReminderCard from "@/components/ReminderCard";
import NotificationPopup from "@/components/NotificationPopup";
import { useReminders } from "@/hooks/useFirebaseReminders";
import { useAuth } from "@/contexts/AuthContext";

const Reminders = () => {
  const { user } = useAuth();
  const {
    reminders,
    activeNotification,
    addReminder,
    deleteReminder,
    dismissNotification,
    loading: remindersLoading,
  } = useReminders();

  return (
    <div className="min-h-screen bg-yellow-300 overflow-hidden">
      {activeNotification && (
        <NotificationPopup
          message={activeNotification.message}
          popContent={activeNotification.popContent}
          onDismiss={dismissNotification}
        />
      )}

      {/* Main Content */}
      <section className="relative z-10 py-4 px-5">
        <div>
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-4xl font-black text-black mb-2">
              Create a Self POP
            </h2>
            <p className="text-black/70">
              Set times to receive meaningful questions
            </p>
          </div>

          {/* Add Reminder Form */}
          <div className="bg-white border-4 border-black p-8 mb-8">
              <AddReminderForm onAdd={(time) => {
                if (typeof time === "string") {
                  addReminder({ type: "one-time", value: time });
                } else {
                  addReminder(time);
                }
              }} />
            </div>

          {/* Reminders List Section */}
          <div>
            <h3 className="text-3xl font-black text-black mb-6 flex items-center gap-3">
              Scheduled Self POPs
              {reminders.length > 0 && (
                <span className="inline-flex items-center justify-center h-8 w-8 bg-yellow-600 text-white text-sm font-bold">
                  {reminders.length}
                </span>
              )}
            </h3>

            {reminders.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 p-12 text-center">
                <p className="text-gray-700 font-medium text-lg">
                  No reminders yet
                </p>
                <p className="text-gray-500 mt-2">
                  Create your first reminder above to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="bg-white border border-gray-200 p-6 transition-shadow">
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
