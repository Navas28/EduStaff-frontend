"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const GENDERS = ["MALE", "FEMALE"];

const EMPTY_ACCOUNT = { name: "", email: "", roleId: "" };
const EMPTY_PROFILE = {
  staffType: "TEACHING",
  designation: "",
  phone: "",
  emergencyContact: "",
  gender: "MALE",
  dob: "",
  joiningDate: "",
  qualification: "",
};

// No API calls happen until the final "Create staff" submit, so closing the wizard at any
// point before then leaves no orphaned account behind.
export default function AddStaffWizard({ open, roles, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState(EMPTY_ACCOUNT);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [userId, setUserId] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep(1);
    setAccount(EMPTY_ACCOUNT);
    setProfile(EMPTY_PROFILE);
    setUserId(null);
    setTemporaryPassword(null);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAccountSubmit = (event) => {
    event.preventDefault();
    setError("");
    setStep(2);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      let currentUserId = userId;
      let currentTempPassword = temporaryPassword;

      if (!currentUserId) {
        const { data } = await apiFetch("/users", {
          method: "POST",
          body: JSON.stringify({
            name: account.name,
            email: account.email,
            roleId: account.roleId || undefined,
          }),
        });
        currentUserId = data.id;
        currentTempPassword = data.temporaryPassword;
        setUserId(currentUserId);
        setTemporaryPassword(currentTempPassword);
      }

      await apiFetch("/staff", {
        method: "POST",
        body: JSON.stringify({ ...profile, userId: currentUserId }),
      });

      const result = {
        name: account.name,
        email: account.email,
        temporaryPassword: currentTempPassword,
      };
      reset();
      onCreated(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 1 ? "Add staff — account" : "Add staff — profile"}
    >
      {step === 1 ? (
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <Input
            id="wizard-name"
            label="Full name"
            required
            value={account.name}
            onChange={(event) => setAccount({ ...account, name: event.target.value })}
            placeholder="e.g. Priya Sharma"
          />
          <Input
            id="wizard-email"
            label="Email"
            type="email"
            required
            value={account.email}
            onChange={(event) => setAccount({ ...account, email: event.target.value })}
            placeholder="priya.sharma@school.com"
          />
          <Select
            id="wizard-role"
            label="Role"
            value={account.roleId}
            onChange={(event) => setAccount({ ...account, roleId: event.target.value })}
          >
            <option value="">No role (assign later)</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Next: Profile details</Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Select
            id="wizard-staffType"
            label="Staff type"
            value={profile.staffType}
            onChange={(event) => setProfile({ ...profile, staffType: event.target.value })}
          >
            <option value="TEACHING">Teaching</option>
            <option value="NON_TEACHING">Non-teaching</option>
          </Select>
          <Input
            id="wizard-designation"
            label="Designation"
            required
            value={profile.designation}
            onChange={(event) => setProfile({ ...profile, designation: event.target.value })}
            placeholder="e.g. Senior Mathematics Faculty"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="wizard-phone"
              label="Phone"
              required
              value={profile.phone}
              onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
            />
            <Input
              id="wizard-emergency"
              label="Emergency contact"
              value={profile.emergencyContact}
              onChange={(event) =>
                setProfile({ ...profile, emergencyContact: event.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="wizard-gender"
              label="Gender"
              value={profile.gender}
              onChange={(event) => setProfile({ ...profile, gender: event.target.value })}
            >
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender.charAt(0) + gender.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
            <Input
              id="wizard-dob"
              label="Date of birth"
              type="date"
              required
              value={profile.dob}
              onChange={(event) => setProfile({ ...profile, dob: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="wizard-joining"
              label="Joining date"
              type="date"
              required
              value={profile.joiningDate}
              onChange={(event) => setProfile({ ...profile, joiningDate: event.target.value })}
            />
            <Input
              id="wizard-qualification"
              label="Qualification"
              value={profile.qualification}
              onChange={(event) =>
                setProfile({ ...profile, qualification: event.target.value })
              }
              placeholder="e.g. M.Sc, B.Ed"
            />
          </div>

          {error ? (
            <p className="rounded-sm border-[1.5px] border-stamp-red bg-stamp-red-tint px-3 py-2 text-sm text-stamp-red">
              {error}
            </p>
          ) : null}

          <div className="flex justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
              disabled={submitting}
            >
              Back
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create staff"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
