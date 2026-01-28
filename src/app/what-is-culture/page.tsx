'use client';

import { Users, Utensils, BookOpen, Drama, Home, Quote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-full">
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-muted-foreground text-base">
        {children}
      </CardContent>
    </Card>
);

export default function WhatIsCulturePage() {
    return (
        <div className="py-12 max-w-4xl mx-auto space-y-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">What is Culture?</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    A simple question with a deep answer that sits at the very heart of Go2Culture.
                </p>
            </div>

            <div className="space-y-8">
                <Section icon={Users} title="Culture is How We Live">
                    <p className="text-lg text-foreground">Culture is how people live, eat, celebrate, and relate to one another — shaped by shared history, values, and everyday habits.</p>
                    <p>It’s not what people *say* they are. It’s what they **do**, every day.</p>
                </Section>
                
                 <Card className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
                    <CardHeader>
                        <CardTitle className="text-destructive">Culture is NOT Just...</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ul className="flex flex-wrap gap-4 justify-center">
                            <li className="font-medium">Festivals</li>
                            <li className="font-medium">Clothing</li>
                            <li className="font-medium">Music</li>
                            <li className="font-medium">Food Alone</li>
                             <li className="font-medium">National Identity</li>
                        </ul>
                        <p className="text-center mt-4 text-sm">Those are **expressions** of culture — not culture itself.</p>
                    </CardContent>
                </Card>

                <Section icon={BookOpen} title="A Deeper Definition">
                    <p className="text-lg text-foreground">Culture is the shared way a group of people make meaning of life — through routines, traditions, food, language, values, and social rules — passed down over time.</p>
                    <p>It answers questions like:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>How do we welcome guests?</li>
                        <li>What do we eat together?</li>
                        <li>How do we show respect?</li>
                        <li>How do we celebrate, mourn, and connect?</li>
                    </ul>
                </Section>

                <Section icon={Utensils} title="Why Food is Central to Culture">
                     <p className="text-lg text-foreground">Food is where culture becomes **lived**, not symbolic.</p>
                    <p>Because food:</p>
                     <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Is daily (not occasional)</li>
                        <li>Is taught at home</li>
                        <li>Is shared, not performed</li>
                        <li>Carries memory and identity</li>
                    </ul>
                    <div className="pt-4">
                        <blockquote className="border-l-4 border-primary pl-4 italic text-foreground font-semibold">
                            "Culture is most real around a table, not on a stage."
                        </blockquote>
                    </div>
                     <p>This insight is the heart of Go2Culture.</p>
                </Section>

                 <Section icon={Drama} title="Culture vs. Tourism">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/2 text-lg">Tourism</TableHead>
                                <TableHead className="w-1/2 text-lg">Culture</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow><TableCell>Observed</TableCell><TableCell>Participated In</TableCell></TableRow>
                            <TableRow><TableCell>Curated for outsiders</TableCell><TableCell>Lived by locals</TableCell></TableRow>
                            <TableRow><TableCell>Transactional</TableCell><TableCell>Relational</TableCell></TableRow>
                            <TableRow><TableCell>Often commercial</TableCell><TableCell>Often personal</TableCell></TableRow>
                        </TableBody>
                    </Table>
                     <p className="font-semibold text-foreground text-center pt-2">Go2Culture sits firmly on the culture side.</p>
                </Section>
                
                <Section icon={Home} title="Culture is Invisible Until You Enter It">
                    <p>You don’t learn culture by reading a sign, watching a show, or ordering from a menu.</p>
                    <p>You learn it by:</p>
                     <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Entering a home</li>
                        <li>Sharing a meal</li>
                        <li>Listening to stories</li>
                        <li>Observing small rituals</li>
                    </ul>
                    <p className="font-semibold text-foreground">That’s why our model works.</p>
                </Section>
                
                 <div className="bg-primary text-primary-foreground p-8 rounded-lg text-center">
                    <Quote className="h-10 w-10 mx-auto mb-4" />
                    <h2 className="font-headline text-3xl font-bold">Culture is how people live and connect — and food is where it’s shared most honestly.</h2>
                </div>
            </div>
        </div>
    );
}
