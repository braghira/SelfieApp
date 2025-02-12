import {
  CalendarDaysIcon,
  CalendarRangeIcon,
  CalendarX2Icon,
  CalendarFoldIcon,
  ClockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useEvents } from "@/context/EventContext";
import { useNoteContext } from "@/context/NoteContext";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import { EventType, RecurrenceType } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadialPomodoroChart } from "@/components/dashboard/RadialPomodoroChart";
import NoteCard from "@/components/editor/notecard";
import SendMessage from "@/components/dashboard/SendMessage";
import moment from "moment";
import { useTimeMachineContext } from "@/context/TimeMachine";
import ActivityTable from "@/components/ActivityList";

export default function Home() {
  const { events } = useEvents();
  const { notes } = useNoteContext();
  const { currentDate } = useTimeMachineContext();
  const [pomodoroEvent, setPomodoroEvent] = useState<EventType | null>(null);
  const [pomodoroSwitch, setPomodoroSwitch] = useState(false);
  const [pomodoroProgress, setPomodoroProgress] = useState(0);
  const navigate = useNavigate();

  const eventFilter: FilterFn<EventType> = (
    row: Row<EventType>,
    columnId: string,
    filterValue: unknown
  ) => {
    const filter: string[] = filterValue as string[];
    let condition = false;
    if (filter.includes("monthly")) {
      const value = row.getValue<RecurrenceType>(columnId);
      if (value) condition ||= value.frequency === "monthly";
      else condition ||= false;
    }
    if (filter.includes("weekly")) {
      const value = row.getValue<RecurrenceType>(columnId);
      if (value) condition ||= value.frequency === "weekly";
      else condition ||= false;
    }
    if (filter.includes("daily")) {
      const value = row.getValue<RecurrenceType>(columnId);
      if (value) condition ||= value.frequency === "daily";
      else condition ||= false;
    }
    if (filter.includes("none")) {
      const value = row.getValue<RecurrenceType>(columnId);
      console.log("value on none: ", value);
      condition ||= !value;
    }
    return condition;
  };

  const frequencies = [
    {
      value: "monthly",
      label: "Monthly",
      icon: CalendarDaysIcon,
    },
    {
      value: "weekly",
      label: "Weekly",
      icon: CalendarRangeIcon,
    },
    {
      value: "daily",
      label: "Daily",
      icon: CalendarFoldIcon,
    },
    {
      value: "pomodoro",
      label: "Pomodoro",
      icon: ClockIcon,
    },
    {
      value: "none",
      label: "None",
      icon: CalendarX2Icon,
    },
  ];

  const eventColumns: ColumnDef<EventType>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ cell }) => {
          const date = new Date(cell.getValue<string>());
          const formatted = format(date, "dd/MM/yy");
          return <div>{formatted}</div>;
        },
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ cell }) => {
          return <div>{cell.getValue<string>()} h</div>;
        },
      },
      {
        accessorKey: "recurrencePattern",
        header: "Recurrence Type",
        cell: ({ cell }) => {
          if (cell.getValue()) {
            const pattern = cell.getValue<RecurrenceType>();
            return <div>{pattern.frequency}</div>;
          } else {
            return <div>none</div>;
          }
        },
        filterFn: eventFilter,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const data = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/calendar")}>
                  Open Calendar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(data.title)}
                >
                  Copy Event Title
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [events]
  );

  useEffect(() => {
    // Find pomodoro of the day with same session
    const pomodoro = events.find(
      (e) => moment(e.date).isBefore(currentDate, "day") && e.expiredPomodoro
    );

    if (pomodoro) {
      setPomodoroEvent(pomodoro);

      const currTimerCycles = pomodoro.currPomodoro?.cycles;
      const expectedTimerCycles = pomodoro.expectedPomodoro?.cycles;

      console.log(
        `curr cycles: ${currTimerCycles}, expected cycles: ${expectedTimerCycles}`
      );

      let percentage = 0;

      if (currTimerCycles !== undefined && expectedTimerCycles !== undefined) {
        percentage =
          (expectedTimerCycles - currTimerCycles) / expectedTimerCycles;

        console.log(`cycles percentage: ${percentage}`);

        setPomodoroProgress(percentage);
      }
    }
  }, [events]);

  return (
    <>
      {/* Send message to user Button, aprt from normal document flow */}
      <div className="fixed bottom-14 left-5 z-10">
        <SendMessage />
      </div>

      <div className="view-container grid grid-cols-1 md:grid-rows-2 md:grid-cols-2 gap-5">
        <div className="row-span-1">
          <Card className="bg-background h-full">
            <CardHeader>
              <CardTitle className="flex w-full justify-between">
                Pomodoro
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pomodoro-preview"
                    checked={pomodoroSwitch}
                    onCheckedChange={() => setPomodoroSwitch(!pomodoroSwitch)}
                  />
                  <Label htmlFor="pomodoro-preview">Report View</Label>
                </div>
              </CardTitle>

              <CardDescription>Last pomodoro Session</CardDescription>
            </CardHeader>

            {!pomodoroSwitch && (
              <RadialPomodoroChart
                progress={pomodoroProgress}
              ></RadialPomodoroChart>
            )}
            {pomodoroSwitch && (
              <CardContent>
                <div className="flex flex-col justify-center items-center gap-5 md:flex-row">
                  <div className="flex flex-col justify-center items-center gap-2">
                    <div className="bg-primary h-[200px] w-[200px] md:h-[150px] md:w-[150px] rounded-full flex-center font-bold text-red-50">
                      {pomodoroEvent?.expectedPomodoro?.study &&
                        pomodoroEvent?.expectedPomodoro?.study / 60000}
                      m
                    </div>
                    <Badge>Study</Badge>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-2">
                    <div className="bg-yellow-600 h-[200px] w-[200px] md:h-[150px] md:w-[150px] rounded-full flex-center font-bold text-yellow-50">
                      {pomodoroEvent?.expectedPomodoro?.relax &&
                        pomodoroEvent?.expectedPomodoro?.relax / 60000}
                      m
                    </div>
                    <Badge className="bg-yellow-600">Relax</Badge>
                  </div>
                </div>
                <Separator className="my-4" />
                <Table>
                  <TableCaption>Pomodoro Stats</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead colSpan={3} className="w-[100px] text-right">
                        Cycles
                      </TableHead>
                      <TableHead colSpan={2}>Session Length</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Last Session</TableCell>
                      <TableCell colSpan={2} className="font-medium text-right">
                        {pomodoroEvent?.expectedPomodoro?.cycles &&
                          pomodoroEvent?.currPomodoro?.cycles &&
                          pomodoroEvent?.expectedPomodoro?.cycles -
                            pomodoroEvent?.currPomodoro?.cycles}
                      </TableCell>
                      <TableCell>
                        {pomodoroEvent?.expectedPomodoro?.study &&
                          pomodoroEvent?.expectedPomodoro?.relax &&
                          pomodoroEvent?.expectedPomodoro?.cycles &&
                          ((pomodoroEvent?.expectedPomodoro?.study +
                            pomodoroEvent?.expectedPomodoro?.relax) *
                            pomodoroEvent?.expectedPomodoro?.cycles) /
                            60000}{" "}
                        m
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Expected Session</TableCell>
                      <TableCell colSpan={2} className="font-medium text-right">
                        {pomodoroEvent?.expectedPomodoro?.cycles &&
                          pomodoroEvent?.expectedPomodoro?.cycles}
                      </TableCell>
                      <TableCell>
                        {pomodoroEvent?.expectedPomodoro?.study &&
                          pomodoroEvent?.expectedPomodoro?.relax &&
                          pomodoroEvent?.expectedPomodoro?.cycles &&
                          ((pomodoroEvent?.expectedPomodoro?.study +
                            pomodoroEvent?.expectedPomodoro?.relax) *
                            pomodoroEvent?.expectedPomodoro?.cycles) /
                            60000}{" "}
                        m
                      </TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={1}>Progress Made</TableCell>
                      <TableCell colSpan={4} className="text-right">
                        {pomodoroProgress * 100}%
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="row-span-1 w-full h-full">
          <Card className="bg-background w-full h-full">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex-center md:px-14">
              <Carousel className="w-full max-w-xs">
                <CarouselContent>
                  {notes.map((note) => (
                    <CarouselItem key={note._id}>
                      <NoteCard
                        key={note._id}
                        id={note._id as string}
                        title={note.title}
                        content={note.content}
                        categories={note.categories}
                        createdAt={note.createdAt}
                        updatedAt={note.updatedAt}
                        author={note.author}
                        simplified={true}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="max-md:hidden" />
                <CarouselNext className="max-md:hidden" />
              </Carousel>
            </CardContent>
          </Card>
        </div>

        <div className="row-span-1">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={events}
                columns={eventColumns}
                filterTitleID="title"
                filterColumnID="recurrencePattern"
                filterName="Recurrence"
                filterOptions={frequencies}
              ></DataTable>
            </CardContent>
          </Card>
        </div>

        <div className="row-span-1">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTable isInHome={true} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
