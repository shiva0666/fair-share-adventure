
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trip, Settlement } from "@/types";
import { generateSettlements, formatCurrency, getParticipantName } from "@/utils/expenseCalculator";
import { ArrowRight } from "lucide-react";

interface SettlementViewProps {
  trip: Trip;
}

export function SettlementView({ trip }: SettlementViewProps) {
  const settlements = generateSettlements(trip);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlements</CardTitle>
        <CardDescription>
          Here's how to settle up the expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {settlements.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            All balances are settled! Everyone paid their fair share.
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <SettlementItem
                key={index}
                settlement={settlement}
                participants={trip.participants}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SettlementItemProps {
  settlement: Settlement;
  participants: Trip["participants"];
}

function SettlementItem({ settlement, participants }: SettlementItemProps) {
  const fromName = getParticipantName(settlement.from, participants);
  const toName = getParticipantName(settlement.to, participants);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="font-medium">{fromName}</div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="font-medium">{toName}</div>
      </div>
      <div className="font-semibold">{formatCurrency(settlement.amount)}</div>
    </div>
  );
}
