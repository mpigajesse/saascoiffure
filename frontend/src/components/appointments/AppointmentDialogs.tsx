import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRescheduleAppointment, useMoveAppointment, useEmployees } from '@/hooks/useApi';
import { Calendar, Clock, User } from 'lucide-react';

interface RescheduleDialogProps {
    appointmentId: number;
    currentDate: string;
    currentTime: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RescheduleDialog({ appointmentId, currentDate, currentTime, open, onOpenChange }: RescheduleDialogProps) {
    const [newDate, setNewDate] = useState(currentDate);
    const [newTime, setNewTime] = useState(currentTime);
    const reschedule = useRescheduleAppointment();

    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await reschedule.mutateAsync({ id: appointmentId, date: newDate, time: newTime });
            onOpenChange(false);
        } catch (error) {
            // Error handled by mutation
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Reporter le rendez-vous
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-date">Nouvelle date</Label>
                        <Input
                            id="new-date"
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-time">Nouvelle heure</Label>
                        <Select value={newTime} onValueChange={setNewTime} required>
                            <SelectTrigger id="new-time">
                                <SelectValue placeholder="Choisir l'heure" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeSlots.map((time) => (
                                    <SelectItem key={time} value={time}>
                                        {time}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={reschedule.isPending}>
                            {reschedule.isPending ? 'Report en cours...' : 'Reporter'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface MoveDialogProps {
    appointmentId: number;
    currentEmployeeId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MoveDialog({ appointmentId, currentEmployeeId, open, onOpenChange }: MoveDialogProps) {
    const [newEmployeeId, setNewEmployeeId] = useState<string>('');
    const { data: employeesData } = useEmployees();
    const move = useMoveAppointment();

    const employees = employeesData?.results || [];
    const coiffeurs = employees.filter(e => e.role === 'COIFFEUR' && e.id !== currentEmployeeId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmployeeId) return;

        try {
            await move.mutateAsync({ id: appointmentId, employeeId: parseInt(newEmployeeId) });
            onOpenChange(false);
        } catch (error) {
            // Error handled by mutation
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Déplacer vers un autre coiffeur
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-employee">Nouveau coiffeur</Label>
                        <Select value={newEmployeeId} onValueChange={setNewEmployeeId} required>
                            <SelectTrigger id="new-employee">
                                <SelectValue placeholder="Choisir un coiffeur" />
                            </SelectTrigger>
                            <SelectContent>
                                {coiffeurs.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id.toString()}>
                                        {emp.first_name} {emp.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={move.isPending}>
                            {move.isPending ? 'Déplacement...' : 'Déplacer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
