
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trip, Settlement } from "@/types";
import { generateSettlements, formatCurrency, getParticipantName } from "@/utils/expenseCalculator";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
            <h3 className="text-lg font-semibold">All Balances Settled!</h3>
            <p className="text-muted-foreground">
              Everyone has paid their fair share.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <SettlementItem
                key={index}
                settlement={settlement}
                participants={trip.participants}
                currency={trip.currency}
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
  currency?: string;
}

function SettlementItem({ settlement, participants, currency }: SettlementItemProps) {
  const fromName = getParticipantName(settlement.from, participants);
  const toName = getParticipantName(settlement.to, participants);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="font-medium">{fromName}</div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="font-medium">{toName}</div>
      </div>
      <div className="font-semibold">{formatCurrency(settlement.amount, currency)}</div>
    </div>
  );
}
