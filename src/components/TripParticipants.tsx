
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trip } from "@/types";
import { formatCurrency } from "@/utils/expenseCalculator";

interface TripParticipantsProps {
  trip: Trip;
}

export function TripParticipants({ trip }: TripParticipantsProps) {
  // Sort participants by balance (desc)
  const sortedParticipants = [...trip.participants].sort(
    (a, b) => b.balance - a.balance
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants & Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex justify-between items-center p-2 border-b last:border-b-0"
            >
              <span className="font-medium">{participant.name}</span>
              <span
                className={
                  participant.balance > 0
                    ? "text-green-600 font-medium"
                    : participant.balance < 0
                    ? "text-red-600 font-medium"
                    : "text-gray-600"
                }
              >
                {formatCurrency(participant.balance)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
