
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { complianceRequirementsByState, countryComplianceRequirements, type ComplianceRequirement } from "@/lib/compliance-data";

const ComplianceField = ({ requirement }: { requirement: ComplianceRequirement }) => {
  const { control, watch } = useFormContext();
  const watchCondition = requirement.condition ? watch(`compliance.${requirement.condition}` as any) : true;
  if (!watchCondition) return null;

  return (
    <FormField
      control={control}
      name={`compliance.${requirement.id}` as any}
      render={({ field }) => (
        <FormItem>
          {requirement.type === 'checkbox' ? (
             <div className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{requirement.label}</FormLabel>
                {requirement.description && <FormDescription>{requirement.description}</FormDescription>}
              </div>
            </div>
          ) : (
            <>
              <FormLabel>{requirement.label}</FormLabel>
              {requirement.description && <FormDescription>{requirement.description}</FormDescription>}
              <FormControl><Input {...field} placeholder={requirement.description} /></FormControl>
            </>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function Step7Compliance() {
  const { watch } = useFormContext();
  const watchCountry = watch('location.country');
  const watchRegion = watch('location.region');

  const stateCompliance = watchCountry === 'AU' && watchRegion ? complianceRequirementsByState[watchRegion] : null;
  const countryCompliance = watchCountry ? countryComplianceRequirements[watchCountry] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>7. Legal & Compliance</CardTitle>
        <CardDescription>Please confirm the following for compliance with local regulations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!watchCountry && <p className="text-muted-foreground">Please select your country in the Location section to see relevant compliance requirements.</p>}
        
        {countryCompliance && (
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Requirements for {countryCompliance.name}</h3>
            {countryCompliance.requirements.map((req) => (
              <ComplianceField key={req.id} requirement={req} />
            ))}
          </div>
        )}
        
        {stateCompliance && (
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Requirements for {stateCompliance.name}</h3>
            {stateCompliance.requirements.map((req) => (
              <ComplianceField key={req.id} requirement={req} />
            ))}
          </div>
        )}

        {watchCountry === 'AU' && !watchRegion && <p className="text-muted-foreground">Please select your state/territory to see specific compliance requirements.</p>}
      </CardContent>
    </Card>
  );
}
