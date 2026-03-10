import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import { PEOPLE_CONFIG as initialPeopleConfig, SPECIAL_EVENTS_CONFIG as initialSpecialEventsConfig } from "./config";
import { ConfigEditor } from "./components/ConfigEditor";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface CalendarCell {
  day: string;
  date: string;
  label: string;
}

type CalendarWeek = (CalendarCell | null)[];

type CalendarType = CalendarWeek[];

function rotate(list: string[], start: number) {
  return list.slice(start).concat(list.slice(0, start));
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function mapDayToGridIndex(jsDay: number) {
  // JS: 0=Sun … 6=Sat
  // Grid: 0=Sun … 6=Sat
  return jsDay;
}

export default function ScheduleGenerator() {
  const [peopleConfig, setPeopleConfig] = useState(initialPeopleConfig);
  const [specialEventsConfig, setSpecialEventsConfig] = useState(initialSpecialEventsConfig);

  const PEOPLE = peopleConfig.filter((p) => p.enabled)
    .sort((a, b) => a.order - b.order)
    .map((p) => p.name);

  function Avatar({ label }: { label: string }) {
    const person = peopleConfig.find((p) => p.name === label);
    const specialEvent = specialEventsConfig.find((e) => e.name === label);
    const imgSrc = person
      ? person.avatar_url
      : specialEvent
      ? specialEvent.avatar_url
      : null;

    return (
      <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={label}
            onError={(e) => (e.currentTarget.style.display = "none")}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  function generateCalendar(
    startDate: Date,
    startingPerson: string
  ): CalendarType {
    const weeks: CalendarType = [];
    let rotationIndex = PEOPLE.indexOf(startingPerson);
    const startDayIndex = mapDayToGridIndex(startDate.getDay());

    const specialEventsMap = new Map(
      specialEventsConfig.filter(event => event.enabled).map((event) => [event.dayOfWeek, event.name])
    );

    for (let week = 0; week < 4; week++) {
      const weekDays: CalendarWeek = Array(7).fill(null);
      const rotated = rotate(PEOPLE, rotationIndex);
      let personIndex = 0;

      for (let offset = 0; offset < 7; offset++) {
        const dayIndex = (startDayIndex + offset) % 7;
        const dayName = DAYS[dayIndex];

        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + offset);

        let label = "";
        const specialEvent = specialEventsMap.get(dayName);
        if (specialEvent) {
          label = specialEvent;
        } else {
          if (personIndex < rotated.length) {
            label = rotated[personIndex];
            personIndex++;
          }
        }

        weekDays[dayIndex] = {
          day: dayName,
          date: formatDate(date),
          label,
        };
      }

      rotationIndex = (rotationIndex + personIndex) % PEOPLE.length;

      weeks.push(weekDays);
    }

    return weeks;
  }

  const [date, setDate] = useState("");
  const [startingPerson, setStartingPerson] = useState(PEOPLE[0]);
  const [calendar, setCalendar] = useState<CalendarType>([]);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calendar.length > 0) {
      const [year, month, day] = date.split("-").map(Number);
      setCalendar(
        generateCalendar(new Date(year, month - 1, day), startingPerson)
      );
    }
  }, [peopleConfig, specialEventsConfig]);

  const exportToPng = async () => {
    if (!calendarRef.current) return;

    const dataUrl = await toPng(calendarRef.current, {
      backgroundColor: "#0f172a",
      pixelRatio: 2,
    });

    const link = document.createElement("a");
    link.download = "schedule.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <h1 className="text-3xl font-extrabold text-center tracking-wide">
        BRNE Train Schedule
      </h1>

      <div className="flex justify-center gap-4 items-end flex-wrap">
        <div className="flex flex-col">
          <label className="text-sm mb-1 text-gray-300">
            Start Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-700 bg-gray-800 rounded px-3 py-2 text-gray-100"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1 text-gray-300">
            Starting Person
          </label>
          <select
            value={startingPerson}
            onChange={(e) => setStartingPerson(e.target.value)}
            className="border border-gray-700 bg-gray-800 rounded px-3 py-2 text-gray-100"
          >
            {PEOPLE.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <Button
          className="bg-indigo-600 hover:bg-indigo-500"
          onClick={() => {
            const [year, month, day] = date.split("-").map(Number);
            setCalendar(
              generateCalendar(new Date(year, month - 1, day), startingPerson)
            );
          }}
          disabled={!date}
        >
          Generate
        </Button>

        {calendar.length > 0 && (
          <Button
            variant="outline"
            className="border-indigo-500 text-indigo-300 hover:bg-indigo-900/30"
            onClick={exportToPng}
          >
            Export PNG
          </Button>
        )}
      </div>

      {calendar.length > 0 && (
        <div ref={calendarRef}>
          <Card className="bg-gray-900 border-gray-700 shadow-xl">
            <CardContent className="p-4 sm:p-6 overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 min-w-[900px] mb-4">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="font-bold text-center text-indigo-300 text-sm sm:text-base"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                {calendar.map((week, wi) => (
                  <div
                    key={wi}
                    className="grid grid-cols-7 gap-2 sm:gap-4 min-w-[900px]"
                  >
                    {week.map((cell, di) =>
                      cell ? (
                        <div
                          key={`${wi}-${di}`}
                          className="rounded-xl bg-gray-800 border border-gray-700 p-3 sm:p-4 min-h-[120px] flex flex-col gap-2"
                        >
                          <div className="text-sm font-medium text-gray-300 text-center">
                            {cell.date}
                          </div>

                          <Avatar label={cell.label} />

                          <div className="font-semibold text-sm sm:text-base text-gray-100 text-center leading-snug">
                            {cell.label}
                          </div>
                        </div>
                      ) : (
                        <div key={`${wi}-${di}`} />
                      )
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfigEditor
        peopleConfig={peopleConfig}
        specialEventsConfig={specialEventsConfig}
        onPeopleConfigChange={setPeopleConfig}
        onSpecialEventsConfigChange={setSpecialEventsConfig}
        days={DAYS}
      />
    </div>
  );
}
