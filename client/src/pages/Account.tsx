import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { usePushContext } from "@/context/NotificationContext";
import usePushNotification from "@/hooks/usePushNotification";
import { useEffect, useState } from "react";
import useUpdateAccount from "@/hooks/useUpdateAccount";
import { AccountSchema, AccountType } from "@/lib/utils";

export default function Account() {
  const { user } = useAuth();
  const { RequestPushSub, subscribe, unsubscribe, subLoading, unsubLoading } =
    usePushNotification();
  const { subscription } = usePushContext();
  const { updateAccount } = useUpdateAccount();
  const [isSubscribed, setIsSub] = useState(false);

  const form = useForm<AccountType>({
    resolver: zodResolver(AccountSchema),
    defaultValues: { currPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: AccountType) {
    await updateAccount(values, (err) => {
      form.setError("root.serverError", { message: err });
    });

    if (!form.formState.errors.root) {
      form.reset();
    }
  }

  useEffect(() => {
    console.log(subscription);
    if (subscription) setIsSub(true);
    else setIsSub(false);
  }, [subscription]);

  return (
    <>
      <h3 className="text-lg font-medium">Account</h3>
      <p className="text-sm text-muted-foreground">
        Change your Password and set Push Notifications preferences.
      </p>

      <Separator className="my-4" />

      <div className="flex flex-row items-center justify-between rounded-lg border p-4 mb-5">
        <div className="space-y-0.5">
          <div className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base">
            Push Notifications
          </div>
          <p className="text-sm text-muted-foreground">
            Enable to subscribe to Push notifications. If disabled, many
            features of this app will not work properly.
          </p>
        </div>
        <Switch
          checked={isSubscribed}
          disabled={subLoading || unsubLoading}
          onCheckedChange={() => {
            if (subscription && user?._id) {
              unsubscribe(user?._id);
            } else if (user?._id) {
              RequestPushSub(() => subscribe(user._id));
            }
          }}
        />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-4 w-full"
        >
          <h3 className="mb-4 text-lg font-medium">Change Password</h3>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="currPassword"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel className="text-gray-800 dark:text-gray-100">
                    Current Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      aria-label="Current Password"
                      className="text-sm md:text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel className="text-gray-800 dark:text-gray-100">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      aria-label="New Password"
                      className="text-sm md:text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel className="text-gray-800 dark:text-gray-100">
                    Confirm New Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      aria-label="Current Password"
                      className="text-sm md:text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Server errors */}
          {form.formState.errors.root && (
            <div className="text-sm font-medium text-destructive space-y-2">
              {form.formState.errors.root.serverError.message}
            </div>
          )}

          <Button
            type="submit"
            className="mt-4 sm:w-fit"
            aria-label="Save Changes"
          >
            {form.formState.isSubmitting ? <Loader /> : "Change Password"}
          </Button>
        </form>
      </Form>
    </>
  );
}
