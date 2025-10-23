import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export type Branch = {
  name: string;
  location: string;
  reviewLink: string;
  contactNo: string;
  status?: "active" | "inactive";
};

interface AddBranchFormProps {
  onSubmit?: (branch: Branch) => void;
}

const AddBranchForm: React.FC<AddBranchFormProps> = ({ onSubmit }) => {
  const [branch, setBranch] = useState<Branch>({
    name: "",
    location: "",
    reviewLink: "",
    contactNo: "",
    status: "active",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBranch({ ...branch, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!branch.name || !branch.location || !branch.reviewLink || !branch.contactNo) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess("Branch added successfully!");
      setBranch({ name: "", location: "", reviewLink: "", contactNo: "", status: "active" });
      if (onSubmit) onSubmit(branch);
    } catch {
      setError("Failed to add branch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <h2 className="text-xl font-bold text-[#0047ab]">Add Branch</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Branch Name"
            value={branch.name}
            onChange={handleChange}
            required
          />
          <Input
            name="location"
            placeholder="Location"
            value={branch.location}
            onChange={handleChange}
            required
          />
          <Input
            name="reviewLink"
            placeholder="Review Link"
            value={branch.reviewLink}
            onChange={handleChange}
            required
          />
          <Input
            name="contactNo"
            placeholder="Contact Number"
            value={branch.contactNo}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={branch.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Branch"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddBranchForm;
