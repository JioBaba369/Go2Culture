
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Invalid email address."),
  subject: z.string({ required_error: "Please select a subject." }),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

function ContactForm() {
  const searchParams = useSearchParams();
  const subjectFromQuery = searchParams.get('subject');

  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: subjectFromQuery || '',
      message: ''
    }
  });

  useEffect(() => {
    if (subjectFromQuery) {
      form.setValue('subject', subjectFromQuery);
    }
  }, [subjectFromQuery, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out! We'll get back to you as soon as we can.",
    });
    form.reset({name: '', email: '', subject: subjectFromQuery || '', message: ''});
  }

  return (
      <Card>
          <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>The best way to contact our support team.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={!!subjectFromQuery}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="What can we help you with?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                          {subjectFromQuery ? (
                             <SelectItem value={subjectFromQuery}>{subjectFromQuery}</SelectItem>
                          ) : (
                            <>
                              <SelectItem value="General Inquiry">General Question</SelectItem>
                              <SelectItem value="Booking Help">Help with a Booking</SelectItem>
                              <SelectItem value="Hosting Question">A Question About Hosting</SelectItem>
                              <SelectItem value="Feedback & Suggestions">Feedback and Suggestions</SelectItem>
                            </>
                          )}
                        </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="How can we help?..." className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Send Your Message</Button>
              </form>
            </Form>
          </CardContent>
      </Card>
  )
}

export default function ContactPage() {
  return (
    <div className="py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Get in Touch</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Have a question or some feedback for us? We'd love to hear from you.
        </p>
      </div>

      <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-2 gap-12">
        <div>
           <h2 className="font-headline text-3xl font-bold">How to Reach Us</h2>
           <p className="text-muted-foreground mt-2">Fill out the form below, and our friendly team will get back to you within 24 hours.</p>
            <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                    <Mail className="h-6 w-6 text-primary" />
                    <a href="mailto:support@go2culture.com" className="text-lg hover:underline">support@go2culture.com</a>
                </div>
                <div className="flex items-center gap-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <span className="text-lg">Live Chat (Coming Soon)</span>
                </div>
                 <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <span className="text-lg">+1 (555) 123-4567</span>
                </div>
            </div>
        </div>
        <Suspense fallback={<Card><CardHeader><CardTitle>Send a Message</CardTitle><CardDescription>The best way to contact our support team.</CardDescription></CardHeader><CardContent><p>Loading form...</p></CardContent></Card>}>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  );
}
