import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// This is a simplified version of the config types.
// In a real app, you would import them from where they are defined.
interface PersonConfig {
  name: string;
  avatar_url: string;
  enabled: boolean;
  order: number;
}

interface SpecialEventConfig {
  name: string;
  avatar_url: string;
  enabled: boolean;
  dayOfWeek: string;
}

interface ConfigEditorProps {
  peopleConfig: PersonConfig[];
  specialEventsConfig: SpecialEventConfig[];
  onPeopleConfigChange: (newConfig: PersonConfig[]) => void;
  onSpecialEventsConfigChange: (newConfig: SpecialEventConfig[]) => void;
  days: string[];
}

export function ConfigEditor({
  peopleConfig,
  specialEventsConfig,
  onPeopleConfigChange,
  onSpecialEventsConfigChange,
  days,
}: ConfigEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPeopleConfig, setEditedPeopleConfig] = useState(peopleConfig);
  const [editedSpecialEventsConfig, setEditedSpecialEventsConfig] = useState(specialEventsConfig);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedPeopleConfig(peopleConfig);
  }, [peopleConfig]);

  useEffect(() => {
    setEditedSpecialEventsConfig(specialEventsConfig);
  }, [specialEventsConfig]);

  const validateConfig = (): boolean => {
    // Check for distinct orders
    const orders = new Set();
    for (const person of editedPeopleConfig) {
      if (orders.has(person.order)) {
        setError(`Duplicate order found: ${person.order}. Orders must be unique.`);
        return false;
      }
      orders.add(person.order);
    }

    // Check for duplicate users (name and avatar_url)
    const users = new Set();
    for (const person of editedPeopleConfig) {
      const userIdentifier = `${person.name}|${person.avatar_url}`;
      if (users.has(userIdentifier)) {
        setError(`Duplicate user found: ${person.name} with avatar ${person.avatar_url}.`);
        return false;
      }
      users.add(userIdentifier);
    }

    // Check for duplicate dayOfWeek in enabled special events
    const daysOfWeek = new Set();
    for (const event of editedSpecialEventsConfig) {
      if (event.enabled) {
        if (daysOfWeek.has(event.dayOfWeek)) {
          setError(`Duplicate day of week found for special events: ${event.dayOfWeek}.`);
          return false;
        }
        daysOfWeek.add(event.dayOfWeek);
      }
    }

    setError(null);
    return true;
  };

  const handleSave = () => {
    if (validateConfig()) {
      onPeopleConfigChange(editedPeopleConfig);
      onSpecialEventsConfigChange(editedSpecialEventsConfig);
      setIsEditing(false);
    }
  };

  const handlePersonChange = (index: number, field: keyof PersonConfig, value: any) => {
    const newConfig = [...editedPeopleConfig];
    newConfig[index] = { ...newConfig[index], [field]: value };
    setEditedPeopleConfig(newConfig);
  };

  const handleSpecialEventChange = (index: number, field: keyof SpecialEventConfig, value: any) => {
    const newConfig = [...editedSpecialEventsConfig];
    newConfig[index] = { ...newConfig[index], [field]: value };
    setEditedSpecialEventsConfig(newConfig);
  };

  return (
    <div className="mt-8 p-6 bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Configuration</h2>
        <Button onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
          {isEditing ? "Save" : "Edit"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">People</h3>
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Avatar URL</th>
                <th scope="col" className="px-6 py-3">Enabled</th>
                <th scope="col" className="px-6 py-3">Order</th>
              </tr>
            </thead>
            <tbody>
              {editedPeopleConfig.map((person, index) => (
                <tr key={index} className="bg-gray-800 border-b border-gray-700">
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => handlePersonChange(index, "name", e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      person.name
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={person.avatar_url}
                        onChange={(e) => handlePersonChange(index, "avatar_url", e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      person.avatar_url
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={person.enabled}
                        onChange={(e) => handlePersonChange(index, "enabled", e.target.checked)}
                        className="bg-gray-700 border border-gray-600 rounded"
                      />
                    ) : (
                      person.enabled.toString()
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={person.order}
                        onChange={(e) => handlePersonChange(index, "order", parseInt(e.target.value, 10))}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      person.order
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Special Events</h3>
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Avatar URL</th>
                <th scope="col" className="px-6 py-3">Enabled</th>
                <th scope="col" className="px-6 py-3">Day of Week</th>
              </tr>
            </thead>
            <tbody>
              {editedSpecialEventsConfig.map((event, index) => (
                <tr key={index} className="bg-gray-800 border-b border-gray-700">
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={event.name}
                        onChange={(e) => handleSpecialEventChange(index, "name", e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      event.name
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={event.avatar_url}
                        onChange={(e) => handleSpecialEventChange(index, "avatar_url", e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      event.avatar_url
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={event.enabled}
                        onChange={(e) => handleSpecialEventChange(index, "enabled", e.target.checked)}
                        className="bg-gray-700 border border-gray-600 rounded"
                      />
                    ) : (
                      event.enabled.toString()
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <select
                        value={event.dayOfWeek}
                        onChange={(e) => handleSpecialEventChange(index, "dayOfWeek", e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-full"
                      >
                        {days.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    ) : (
                      event.dayOfWeek
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
