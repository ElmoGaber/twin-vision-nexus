import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLicense } from '@/contexts/LicenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Shield,
  RefreshCw,
  Ban,
  CheckCircle,
  Edit,
  RotateCcw,
  Users,
} from 'lucide-react';

interface LicenseEntry {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  status: string;
  expires_at: string;
  usage_limit: number;
  usage_count: number;
  allowed_features: string[];
  max_sessions: number;
  max_projects: number;
  created_at: string;
}

const ALL_FEATURES = ['dashboard', 'analytics', 'vr', 'alarms', 'assets', 'settings', 'admin'];

export const AdminLicensePanel = () => {
  const { session } = useAuth();
  const { isAdmin } = useLicense();
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<LicenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLicense, setEditLicense] = useState<LicenseEntry | null>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    expires_at: '',
    usage_limit: 0,
    allowed_features: [] as string[],
    max_sessions: 3,
    max_projects: 1,
  });

  const fetchLicenses = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-licenses', {
        method: 'GET',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (data?.licenses) setLicenses(data.licenses);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch licenses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchLicenses();
  }, [isAdmin, session]);

  const performAction = async (action: string, license_id: string, extra?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-licenses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session!.access_token}` },
        body: { action, license_id, ...extra },
      });
      if (data?.success) {
        toast({ title: 'Success', description: `License ${action} successful` });
        fetchLicenses();
      }
    } catch {
      toast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
    }
  };

  const handleEdit = (l: LicenseEntry) => {
    setEditLicense(l);
    setEditForm({
      status: l.status,
      expires_at: l.expires_at.slice(0, 16),
      usage_limit: l.usage_limit,
      allowed_features: l.allowed_features,
      max_sessions: l.max_sessions,
      max_projects: l.max_projects,
    });
  };

  const handleSaveEdit = async () => {
    if (!editLicense) return;
    await performAction('update', editLicense.id, {
      status: editForm.status,
      expires_at: new Date(editForm.expires_at).toISOString(),
      usage_limit: editForm.usage_limit,
      allowed_features: editForm.allowed_features,
      max_sessions: editForm.max_sessions,
      max_projects: editForm.max_projects,
    });
    setEditLicense(null);
  };

  const toggleFeature = (feature: string) => {
    setEditForm((prev) => ({
      ...prev,
      allowed_features: prev.allowed_features.includes(feature)
        ? prev.allowed_features.filter((f) => f !== feature)
        : [...prev.allowed_features, feature],
    }));
  };

  if (!isAdmin) return null;

  const statusColor: Record<string, string> = {
    active: 'bg-status-normal/20 text-status-normal border-status-normal/30',
    trial: 'bg-primary/20 text-primary border-primary/30',
    expired: 'bg-muted text-muted-foreground border-border',
    revoked: 'bg-destructive/20 text-destructive border-destructive/30',
    suspended: 'bg-status-warning/20 text-status-warning border-status-warning/30',
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>License Management</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={fetchLicenses} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading licenses...</div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-2" />
              No licenses found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-start py-3 px-2 font-medium text-muted-foreground">User</th>
                    <th className="text-start py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-start py-3 px-2 font-medium text-muted-foreground">Expires</th>
                    <th className="text-start py-3 px-2 font-medium text-muted-foreground">Usage</th>
                    <th className="text-start py-3 px-2 font-medium text-muted-foreground">Features</th>
                    <th className="text-end py-3 px-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((l) => (
                    <tr key={l.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-2">
                        <p className="font-medium text-foreground">{l.user_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{l.user_email}</p>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className={statusColor[l.status] || ''}>
                          {l.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(l.expires_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {l.usage_count} / {l.usage_limit}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1 flex-wrap">
                          {l.allowed_features.map((f) => (
                            <Badge key={f} variant="secondary" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-end">
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(l)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {l.status !== 'revoked' ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => performAction('revoke', l.id)}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-status-normal"
                              onClick={() =>
                                performAction('activate', l.id, {
                                  expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
                                  usage_limit: 1000,
                                  allowed_features: ALL_FEATURES,
                                  max_sessions: 5,
                                  max_projects: 3,
                                })
                              }
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => performAction('reset_usage', l.id)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editLicense} onOpenChange={() => setEditLicense(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit License — {editLicense?.user_email}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Expires At</Label>
              <Input
                type="datetime-local"
                value={editForm.expires_at}
                onChange={(e) => setEditForm({ ...editForm, expires_at: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  value={editForm.usage_limit}
                  onChange={(e) => setEditForm({ ...editForm, usage_limit: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Max Sessions</Label>
                <Input
                  type="number"
                  value={editForm.max_sessions}
                  onChange={(e) => setEditForm({ ...editForm, max_sessions: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Max Projects</Label>
                <Input
                  type="number"
                  value={editForm.max_projects}
                  onChange={(e) => setEditForm({ ...editForm, max_projects: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Allowed Features</Label>
              <div className="flex gap-2 flex-wrap">
                {ALL_FEATURES.map((f) => (
                  <Badge
                    key={f}
                    variant={editForm.allowed_features.includes(f) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleFeature(f)}
                  >
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLicense(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
