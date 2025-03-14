
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  country: z.string().min(1, { message: "Please select a country" }),
  state: z.string().min(1, { message: "Please select a state/city" }),
  dateOfBirth: z.date({ required_error: "Please select a date of birth" }),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    required_error: "Please select a gender",
  }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      country: "",
      state: "",
      gender: "prefer-not-to-say",
      termsAccepted: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await registerUser(values.email, values.password, values.name);
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "There was a problem with your registration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // More comprehensive country data
  const countries = [
    { id: "us", name: "United States" },
    { id: "ca", name: "Canada" },
    { id: "uk", name: "United Kingdom" },
    { id: "au", name: "Australia" },
    { id: "in", name: "India" },
    { id: "de", name: "Germany" },
    { id: "fr", name: "France" },
    { id: "it", name: "Italy" },
    { id: "es", name: "Spain" },
    { id: "jp", name: "Japan" },
    { id: "cn", name: "China" },
    { id: "br", name: "Brazil" },
    { id: "mx", name: "Mexico" },
    { id: "za", name: "South Africa" },
    { id: "ru", name: "Russia" },
    { id: "kr", name: "South Korea" },
    { id: "sg", name: "Singapore" },
    { id: "ae", name: "United Arab Emirates" },
    { id: "sa", name: "Saudi Arabia" },
    { id: "nz", name: "New Zealand" },
  ];
  
  // Comprehensive state data for each country
  const states: Record<string, Array<{ id: string; name: string }>> = {
    us: [
      { id: "al", name: "Alabama" },
      { id: "ak", name: "Alaska" },
      { id: "az", name: "Arizona" },
      { id: "ar", name: "Arkansas" },
      { id: "ca", name: "California" },
      { id: "co", name: "Colorado" },
      { id: "ct", name: "Connecticut" },
      { id: "de", name: "Delaware" },
      { id: "fl", name: "Florida" },
      { id: "ga", name: "Georgia" },
      { id: "hi", name: "Hawaii" },
      { id: "id", name: "Idaho" },
      { id: "il", name: "Illinois" },
      { id: "in", name: "Indiana" },
      { id: "ia", name: "Iowa" },
      { id: "ks", name: "Kansas" },
      { id: "ky", name: "Kentucky" },
      { id: "la", name: "Louisiana" },
      { id: "me", name: "Maine" },
      { id: "md", name: "Maryland" },
      { id: "ma", name: "Massachusetts" },
      { id: "mi", name: "Michigan" },
      { id: "mn", name: "Minnesota" },
      { id: "ms", name: "Mississippi" },
      { id: "mo", name: "Missouri" },
      { id: "mt", name: "Montana" },
      { id: "ne", name: "Nebraska" },
      { id: "nv", name: "Nevada" },
      { id: "nh", name: "New Hampshire" },
      { id: "nj", name: "New Jersey" },
      { id: "nm", name: "New Mexico" },
      { id: "ny", name: "New York" },
      { id: "nc", name: "North Carolina" },
      { id: "nd", name: "North Dakota" },
      { id: "oh", name: "Ohio" },
      { id: "ok", name: "Oklahoma" },
      { id: "or", name: "Oregon" },
      { id: "pa", name: "Pennsylvania" },
      { id: "ri", name: "Rhode Island" },
      { id: "sc", name: "South Carolina" },
      { id: "sd", name: "South Dakota" },
      { id: "tn", name: "Tennessee" },
      { id: "tx", name: "Texas" },
      { id: "ut", name: "Utah" },
      { id: "vt", name: "Vermont" },
      { id: "va", name: "Virginia" },
      { id: "wa", name: "Washington" },
      { id: "wv", name: "West Virginia" },
      { id: "wi", name: "Wisconsin" },
      { id: "wy", name: "Wyoming" },
    ],
    ca: [
      { id: "ab", name: "Alberta" },
      { id: "bc", name: "British Columbia" },
      { id: "mb", name: "Manitoba" },
      { id: "nb", name: "New Brunswick" },
      { id: "nl", name: "Newfoundland and Labrador" },
      { id: "ns", name: "Nova Scotia" },
      { id: "on", name: "Ontario" },
      { id: "pe", name: "Prince Edward Island" },
      { id: "qc", name: "Quebec" },
      { id: "sk", name: "Saskatchewan" },
      { id: "nt", name: "Northwest Territories" },
      { id: "nu", name: "Nunavut" },
      { id: "yt", name: "Yukon" },
    ],
    uk: [
      { id: "eng", name: "England" },
      { id: "sct", name: "Scotland" },
      { id: "wls", name: "Wales" },
      { id: "nir", name: "Northern Ireland" },
      { id: "lnd", name: "London" },
      { id: "brm", name: "Birmingham" },
      { id: "mch", name: "Manchester" },
      { id: "gla", name: "Glasgow" },
      { id: "edb", name: "Edinburgh" },
      { id: "brs", name: "Bristol" },
    ],
    au: [
      { id: "nsw", name: "New South Wales" },
      { id: "qld", name: "Queensland" },
      { id: "sa", name: "South Australia" },
      { id: "tas", name: "Tasmania" },
      { id: "vic", name: "Victoria" },
      { id: "wa", name: "Western Australia" },
      { id: "act", name: "Australian Capital Territory" },
      { id: "nt", name: "Northern Territory" },
    ],
    in: [
      { id: "ap", name: "Andhra Pradesh" },
      { id: "ar", name: "Arunachal Pradesh" },
      { id: "as", name: "Assam" },
      { id: "br", name: "Bihar" },
      { id: "cg", name: "Chhattisgarh" },
      { id: "ga", name: "Goa" },
      { id: "gj", name: "Gujarat" },
      { id: "hr", name: "Haryana" },
      { id: "hp", name: "Himachal Pradesh" },
      { id: "jk", name: "Jammu and Kashmir" },
      { id: "jh", name: "Jharkhand" },
      { id: "ka", name: "Karnataka" },
      { id: "kl", name: "Kerala" },
      { id: "mp", name: "Madhya Pradesh" },
      { id: "mh", name: "Maharashtra" },
      { id: "mn", name: "Manipur" },
      { id: "ml", name: "Meghalaya" },
      { id: "mz", name: "Mizoram" },
      { id: "nl", name: "Nagaland" },
      { id: "or", name: "Odisha" },
      { id: "pb", name: "Punjab" },
      { id: "rj", name: "Rajasthan" },
      { id: "sk", name: "Sikkim" },
      { id: "tn", name: "Tamil Nadu" },
      { id: "tg", name: "Telangana" },
      { id: "tr", name: "Tripura" },
      { id: "up", name: "Uttar Pradesh" },
      { id: "uk", name: "Uttarakhand" },
      { id: "wb", name: "West Bengal" },
      { id: "dl", name: "Delhi" },
    ],
    // Add more countries as needed with their states/regions
    de: [
      { id: "bw", name: "Baden-Württemberg" },
      { id: "by", name: "Bavaria" },
      { id: "be", name: "Berlin" },
      { id: "bb", name: "Brandenburg" },
      { id: "hb", name: "Bremen" },
      { id: "hh", name: "Hamburg" },
      { id: "he", name: "Hesse" },
      { id: "mv", name: "Mecklenburg-Vorpommern" },
      { id: "ni", name: "Lower Saxony" },
      { id: "nw", name: "North Rhine-Westphalia" },
      { id: "rp", name: "Rhineland-Palatinate" },
      { id: "sl", name: "Saarland" },
      { id: "sn", name: "Saxony" },
      { id: "st", name: "Saxony-Anhalt" },
      { id: "sh", name: "Schleswig-Holstein" },
      { id: "th", name: "Thuringia" },
    ],
    fr: [
      { id: "idf", name: "Île-de-France" },
      { id: "ara", name: "Auvergne-Rhône-Alpes" },
      { id: "bfc", name: "Bourgogne-Franche-Comté" },
      { id: "bre", name: "Brittany" },
      { id: "cvl", name: "Centre-Val de Loire" },
      { id: "cor", name: "Corsica" },
      { id: "ges", name: "Grand Est" },
      { id: "hdf", name: "Hauts-de-France" },
      { id: "nor", name: "Normandy" },
      { id: "naq", name: "Nouvelle-Aquitaine" },
      { id: "occ", name: "Occitanie" },
      { id: "pdl", name: "Pays de la Loire" },
      { id: "pac", name: "Provence-Alpes-Côte d'Azur" },
    ],
  };

  const selectedCountry = form.watch("country");
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
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
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create a password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/City</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedCountry}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedCountry ? "Select country first" : "Select state/city"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedCountry && states[selectedCountry]?.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <label htmlFor="male">Male</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <label htmlFor="female">Female</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <label htmlFor="other">Other</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                      <label htmlFor="prefer-not-to-say">Prefer not to say</label>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the{" "}
                  <a href="/terms" className="text-primary underline">
                    terms and conditions
                  </a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
