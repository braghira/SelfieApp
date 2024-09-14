import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { ActivityType } from "@/lib/utils"
import useActivitiesApi from "@/hooks/useActivitiesApi"
import { useAuth } from "@/context/AuthContext";

import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

//date-fns
import { format } from "date-fns";

interface ActivityDetailsProps {
  activities: ActivityType[];
}

export default function ActivityList({ activities }: ActivityDetailsProps) {
  const { user } = useAuth();
  const { deleteActivity, completeActivity } = useActivitiesApi();

  async function handleDelete(activity: ActivityType) {
    if (user) {
      deleteActivity(activity);
    }
  }

  async function handleComplete(activity: ActivityType) {
    if (user) {
      completeActivity(activity);
    }
  }

  return (
    <Tabs defaultValue="inProgress" className="w-[300px] mt-8">
      ACTIVITY LIST
      <TabsList className="grid w-full grid-cols-3 mt-3">
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="inProgress">In Progress</TabsTrigger>
        <TabsTrigger value="late">Late</TabsTrigger>
      </TabsList>
      
      <TabsContent value="completed">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Title</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="completedAct">
            {activities
              .filter(activity => activity.completed)
              .map(activity => (
                <TableRow key={activity._id}>
                  <TableCell className="font-medium">{activity.title}</TableCell> 
                  <TableCell>{activity.endDate ? format(new Date(activity.endDate), "dd/MM/yy") : ""}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleDelete(activity)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TabsContent>
      
      <TabsContent value="inProgress">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Title</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="inProgressAct">
            {activities
              .filter(activity => !activity.completed)
              .map(activity => (
                <TableRow key={activity._id}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>{activity.endDate ? format(new Date(activity.endDate), "dd/MM/yy") : ""}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleComplete(activity)}>Complete</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(activity)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="late">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Title</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow> 
          </TableHeader>
          <TableBody className="lateAct">
            {activities
              .filter(activity => activity.endDate && new Date(activity.endDate) < new Date() && !activity.completed)
              .map(activity => (
                <TableRow key={activity._id}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell>{activity.endDate ? format(new Date(activity.endDate), "dd/MM/yy") : ""}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleComplete(activity)}>Complete</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(activity)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  )
}
