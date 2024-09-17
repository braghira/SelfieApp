import Loader from "@/components/Loader";
import {
  CheckCircle2,
  Clock,
  AlertCircleIcon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  CalendarX2Icon,
  CalendarFoldIcon,
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
import { useActivities } from "@/context/ActivityContext";
import { useEvents } from "@/context/EventContext";
import { useNoteContext } from "@/context/NoteContext";
import useActivitiesApi from "@/hooks/useActivitiesApi";
import useEventsApi from "@/hooks/useEventsApi";
import useNotes from "@/hooks/useNote";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import {
  ActivityType,
  cn,
  EventType,
  msToTime,
  RecurrenceType,
} from "@/lib/utils";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
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
import { PomodoroType } from "@/hooks/useTimer";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadialPomodoroChart } from "@/components/RadialPomodoroChart";

export default function Home() {
  const { events } = useEvents();
  const { notes, dispatch } = useNoteContext();
  const { activities } = useActivities();
  const { getEvents } = useEventsApi();
  const { fetchNotes } = useNotes();
  const { getActivities } = useActivitiesApi();
  const [lastPomdoro, setLastPomodoro] = useState<PomodoroType>();
  const [initialPomdoro, setInitialPomodoro] = useState<PomodoroType>();
  const [pomodoroSwitch, setPomodoroSwitch] = useState(false);
  const [pomodoroProgress, setPomodoroProgress] = useState(0);
  const navigate = useNavigate();

  const activityFilter: FilterFn<ActivityType> = (
    row: Row<ActivityType>,
    columnId: string,
    filterValue: unknown
  ) => {
    const filter: string[] = filterValue as string[];
    let condition = false;
    if (filter.includes("late")) {
      condition ||=
        !row.getValue(columnId) &&
        new Date(row.getValue<string>("endDate")) < new Date();
    }
    if (filter.includes("in progress")) {
      condition ||=
        !row.getValue(columnId) &&
        new Date(row.getValue<string>("endDate")) > new Date();
    }
    if (filter.includes("done")) {
      condition ||= row.getValue(columnId);
    }
    return condition;
  };

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

  const statuses = [
    {
      value: "late",
      label: "Late",
      icon: AlertCircleIcon,
    },
    {
      value: "in progress",
      label: "In Progress",
      icon: Clock,
    },
    {
      value: "done",
      label: "Done",
      icon: CheckCircle2,
    },
  ];

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
      value: "none",
      label: "None",
      icon: CalendarX2Icon,
    },
  ];

  const activityColumns: ColumnDef<ActivityType>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ cell, row }) => {
        const date = new Date(row.getValue<string>("endDate"));
        if (!row.getValue("completed") && date < new Date())
          return (
            <div className="text-destructive">{cell.getValue<string>()}</div>
          );
        else return <div>{cell.getValue<string>()}</div>;
      },
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Expiration
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ cell, row }) => {
        const date = new Date(cell.getValue<string>());
        const formatted = format(date, "dd/MM");
        let classname = "";
        if (!row.getValue("completed") && date < new Date())
          classname = "text-destructive";
        return (
          <div className={cn("font-semibold text-center", classname)}>
            {formatted}
          </div>
        );
      },
    },
    {
      accessorKey: "completed",
      header: "Status",
      cell: ({ row, cell }) => {
        if (cell.getValue())
          return <div className="text-green-700">Completed</div>;
        else if (
          !cell.getValue() &&
          new Date(row.getValue("endDate")) > new Date()
        ) {
          return <div>In progress</div>;
        } else return <div className="text-destructive">Late</div>;
      },
      filterFn: activityFilter,
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
                Copy Activity Title
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const eventColumns: ColumnDef<EventType>[] = [
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
  ];

  useEffect(() => {
    // GET events, last note, activities and last pomodoro session
    getEvents();
    getActivities();
    fetchNotes();
    // setLastPomodoro(getLastPomodoro());
    setLastPomodoro({
      totalTime: 10500000 - 2100000 * 3,
      cycles: 3,
      study: { initialValue: 1800000, value: 1800000, started: false },
      relax: { initialValue: 300000, value: 300000, started: false },
      isStudyCycle: true,
    });
    setInitialPomodoro({
      totalTime: 10500000,
      cycles: 5,
      study: { initialValue: 1800000, value: 1800000, started: false },
      relax: { initialValue: 300000, value: 300000, started: false },
      isStudyCycle: true,
    });
  }, []);

  useEffect(() => {
    let percentage = 0;
    if (lastPomdoro && initialPomdoro)
      percentage = lastPomdoro?.cycles / initialPomdoro?.cycles;

    setPomodoroProgress(percentage);
  }, [initialPomdoro, lastPomdoro]);

  return (
    <div className="view-container grid grid-cols-1 md:grid-rows-3 md:grid-cols-2 gap-5">
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
                    {lastPomdoro && msToTime(lastPomdoro.study.value)}
                  </div>
                  <Badge>Study</Badge>
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                  <div className="bg-yellow-600 h-[200px] w-[200px] md:h-[150px] md:w-[150px] rounded-full flex-center font-bold text-yellow-50">
                    {lastPomdoro && msToTime(lastPomdoro.relax.value)}
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
                      {lastPomdoro?.cycles}
                    </TableCell>
                    <TableCell>
                      {lastPomdoro && msToTime(lastPomdoro?.totalTime)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Expected Session</TableCell>
                    <TableCell colSpan={2} className="font-medium text-right">
                      {initialPomdoro?.cycles}
                    </TableCell>
                    <TableCell>
                      {initialPomdoro && msToTime(initialPomdoro?.totalTime)}
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={1}>Progress Made</TableCell>
                    <TableCell colSpan={4} className="text-right">
                      {lastPomdoro &&
                        initialPomdoro &&
                        (lastPomdoro.cycles / initialPomdoro?.cycles) * 100}
                      %
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
                {events.map((event) => (
                  <CarouselItem key={event._id}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-primary">
                          {event.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        {event.date}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="max-md:hidden" />
              <CarouselNext className="max-md:hidden" />
            </Carousel>
          </CardContent>
        </Card>
      </div>

      <div className="row-span-2">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle>Activities</CardTitle>
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

      <div className="row-span-2">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={activities}
              columns={activityColumns}
              filterColumnID="title"
              filterTitleID="completed"
              filterName="Status"
              filterOptions={statuses}
            ></DataTable>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
