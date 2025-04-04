
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Participant } from "@/types";

interface AddParticipantFormProps {
  onAddParticipant: (participant: Omit<Participant, 'id' | 'balance'>) => void;
}

export const AddParticipantForm = ({ onAddParticipant }: AddParticipantFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim()) {
      onAddParticipant({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined
      });
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Participant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
            autoComplete="off"
            required
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="email" className="text-sm font-medium">
            Email (optional)
          </Label>
          <Input
            id="email"
            placeholder="email@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            autoComplete="off"
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone (optional)
          </Label>
          <Input
            id="phone"
            placeholder="+1234567890"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </form>
  );
};
