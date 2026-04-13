"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FieldErrors, useForm } from "react-hook-form";
import { CheckCircle2, LoaderCircle, Save, SendHorizonal } from "lucide-react";
import { REGULATIVE_PRINCIPLES } from "@/lib/constants";
import { questionnaireDefaults } from "@/lib/questionnaire-defaults";
import { questionnaireSchema, type QuestionnaireValues } from "@/lib/validations/profile";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProfilePhotoUpload } from "@/components/forms/profile-photo-upload";

const radioOptions = {
  yesNo: [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ],
  gender: [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ],
  parents: [
    { label: "Both", value: "both" },
    { label: "One", value: "one" },
    { label: "None", value: "none" },
  ],
  homeCategory: [
    { label: "Owned", value: "owned" },
    { label: "Rented", value: "rented" },
  ],
};

function getDefaultBirthDate() {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 21);
  return today.toISOString().slice(0, 10);
}

function parseBirthTime(value: string) {
  const defaultState: { hour: string; minute: string; meridiem: "AM" | "PM" } = {
    hour: "12",
    minute: "00",
    meridiem: "AM",
  };
  if (!value || !value.includes(":")) {
    return defaultState;
  }

  const [hourString, minute = "00"] = value.split(":");
  const hourNumber = Number(hourString);
  if (Number.isNaN(hourNumber)) {
    return defaultState;
  }

  const meridiem: "AM" | "PM" = hourNumber >= 12 ? "PM" : "AM";
  const normalizedHour = hourNumber % 12 || 12;

  return {
    hour: String(normalizedHour).padStart(2, "0"),
    minute: minute.padStart(2, "0"),
    meridiem,
  };
}

function parseBirthDate(value: string) {
  const defaultState = {
    day: "",
    month: "",
    year: "",
  };

  if (!value || !value.includes("-")) {
    return defaultState;
  }

  const [year = "", month = "", day = ""] = value.split("-");
  return {
    day,
    month,
    year,
  };
}

function toIsoDate({
  day,
  month,
  year,
}: {
  day: string;
  month: string;
  year: string;
}) {
  if (!day || !month || !year) {
    return "";
  }

  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function toTwentyFourHour({
  hour,
  minute,
  meridiem,
}: {
  hour: string;
  minute: string;
  meridiem: "AM" | "PM";
}) {
  const parsedHour = Number(hour);
  if (Number.isNaN(parsedHour)) {
    return "";
  }

  let nextHour = parsedHour % 12;
  if (meridiem === "PM") {
    nextHour += 12;
  }

  return `${String(nextHour).padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function Field({
  label,
  error,
  asLabel = true,
  children,
}: {
  label: string;
  error?: string;
  asLabel?: boolean;
  children: React.ReactNode;
}) {
  const Wrapper = asLabel ? "label" : "div";

  return (
    <Wrapper className="block space-y-2">
      <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
      {children}
      {error ? <span className="block text-sm text-[var(--danger)]">{error}</span> : null}
    </Wrapper>
  );
}

function RadioGroup({
  name,
  value,
  options,
  register,
  setValue,
}: {
  name: keyof QuestionnaireValues;
  value: string;
  options: Array<{ label: string; value: string }>;
  register: ReturnType<typeof useForm<QuestionnaireValues>>["register"];
  setValue: ReturnType<typeof useForm<QuestionnaireValues>>["setValue"];
}) {
  const field = register(name);

  return (
    <div className="flex flex-wrap gap-3">
      <input type="hidden" name={field.name} ref={field.ref} value={value} onBlur={field.onBlur} readOnly />
      {options.map((option) => (
        <button
          key={`${String(name)}-${option.value}`}
          type="button"
          aria-pressed={value === option.value}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
            value === option.value
              ? "border-[var(--primary)] bg-[var(--primary)]/12 text-[var(--primary)]"
              : "border-[var(--border)] bg-white/75 text-[var(--foreground)]"
          }`}
          onClick={() => {
            setValue(name, option.value as QuestionnaireValues[typeof name], {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        >
          <span
            className={`h-4 w-4 rounded-full border transition ${
              value === option.value
                ? "border-[var(--primary)] bg-[var(--primary)] shadow-[inset_0_0_0_3px_rgba(255,255,255,0.9)]"
                : "border-[var(--muted)] bg-transparent"
            }`}
          />
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function ProfileForm({
  initialValues,
}: {
  initialValues?: Partial<QuestionnaireValues>;
}) {
  const mergedDefaults = useMemo(
    () => ({
      ...questionnaireDefaults,
      ...initialValues,
      birthDate: initialValues?.birthDate || getDefaultBirthDate(),
      birthTime: initialValues?.birthTime || "00:00",
      regs: initialValues?.regs ?? questionnaireDefaults.regs,
    }),
    [initialValues]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setFocus,
    clearErrors,
    formState: { errors },
  } = useForm<QuestionnaireValues>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: mergedDefaults,
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: true,
  });

  const [submitMessage, setSubmitMessage] = useState("");
  const [submitMessageType, setSubmitMessageType] = useState<"success" | "error">("success");
  const [draftPopupOpen, setDraftPopupOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isDraftPending, startDraftTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const photoSectionRef = useRef<HTMLDivElement | null>(null);

  const photoUrl = watch("photoUrl");
  const photoKey = watch("photoKey");
  const currentAddress = watch("address");
  const isInitiated = watch("isInitiated");
  const isWorking = watch("working");
  const birthDateValue = watch("birthDate");
  const birthTimeValue = watch("birthTime");
  const parsedBirthDate = useMemo(() => parseBirthDate(birthDateValue), [birthDateValue]);
  const parsedBirthTime = useMemo(() => parseBirthTime(birthTimeValue), [birthTimeValue]);
  const [birthDateParts, setBirthDateParts] = useState(parsedBirthDate);

  useEffect(() => {
    setBirthDateParts(parsedBirthDate);
  }, [parsedBirthDate]);

  useEffect(() => {
    if (isInitiated !== "yes") {
      clearErrors("initiatedName");
    }
  }, [clearErrors, isInitiated]);

  useEffect(() => {
    if (isWorking !== "yes") {
      clearErrors(["profession", "jobLocation", "salary"]);
    }
  }, [clearErrors, isWorking]);

  function updateBirthDateParts(nextParts: { day: string; month: string; year: string }) {
    setBirthDateParts(nextParts);

    const composedDate = toIsoDate(nextParts);
    if (composedDate) {
      setValue("birthDate", composedDate, { shouldDirty: true, shouldValidate: true });
      return;
    }

    setValue("birthDate", "", { shouldDirty: true, shouldValidate: false });
    clearErrors("birthDate");
  }

  function focusFirstInvalidField(formErrors: FieldErrors<QuestionnaireValues>) {
    const firstErrorKey = Object.keys(formErrors)[0] as keyof QuestionnaireValues | undefined;
    if (!firstErrorKey) return;

    if (firstErrorKey === "photoUrl" || firstErrorKey === "photoKey") {
      photoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      photoSectionRef.current?.focus();
      return;
    }

    setFocus(firstErrorKey);
  }

  async function handleDraftSave() {
    const values = watch();
    setSubmitMessage("");
    setSubmitMessageType("success");

    startDraftTransition(async () => {
      const response = await fetch("/api/profile/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = await response.json();
      if (response.ok) {
        setSubmitMessage("");
        setSubmitMessageType("success");
        setDraftPopupOpen(true);
      } else {
        setSubmitMessage(payload.message ?? "Unable to save draft.");
        setSubmitMessageType("error");
      }
    });
  }

  const onSubmit = handleSubmit(
    (values) => {
      setSubmitMessage("");
      setSubmitMessageType("success");

      startSubmitTransition(async () => {
        const response = await fetch("/api/profile/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const payload = await response.json();
        if (response.ok) {
          setSubmitMessage("");
          setSubmitMessageType("success");
          setShowSuccessPopup(true);
        } else {
          setSubmitMessage(payload.message ?? "Unable to save profile.");
          setSubmitMessageType("error");
        }
      });
    },
    (formErrors) => {
      setSubmitMessage("Please complete all required fields before submitting.");
      setSubmitMessageType("error");
      focusFirstInvalidField(formErrors);
    }
  );

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[2rem] p-5 sm:p-8"
      >
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">Profile setup</p>
            <h1 className="text-2xl font-semibold sm:text-3xl">Complete your devotional profile</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Your answers are stored in Neon Postgres, and admins use them privately for manual
              matchmaking. Save drafts anytime and submit when complete.
            </p>
          </div>
          <div className="w-fit rounded-full bg-[#fff6ea] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
            In-app + email recommendations
          </div>
        </div>

        <div ref={photoSectionRef}>
          <input type="hidden" {...register("photoUrl")} />
          <input type="hidden" {...register("photoKey")} />
          <ProfilePhotoUpload
            sectionRef={photoSectionRef}
            value={{ photoKey, photoUrl }}
            fieldError={errors.photoUrl?.message}
            onChange={(next) => {
              setValue("photoKey", next.photoKey, { shouldDirty: true, shouldValidate: true });
              setValue("photoUrl", next.photoUrl, { shouldDirty: true, shouldValidate: true });
            }}
          />
        </div>
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <h2 className="mb-6 text-2xl font-semibold">Personal and devotional details</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Full name" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Gender" error={errors.gender?.message} asLabel={false}>
            <RadioGroup name="gender" value={watch("gender")} options={radioOptions.gender} register={register} setValue={setValue} />
          </Field>
          <Field label="Are you initiated?" error={errors.isInitiated?.message} asLabel={false}>
            <RadioGroup name="isInitiated" value={watch("isInitiated")} options={radioOptions.yesNo} register={register} setValue={setValue} />
          </Field>
          <Field label="Initiated name" error={errors.initiatedName?.message}>
            <Input {...register("initiatedName")} disabled={isInitiated !== "yes"} />
          </Field>
          <Field label="Birth date" error={errors.birthDate?.message}>
            <div className="grid grid-cols-3 gap-3">
              <Select
                value={birthDateParts.day}
                onChange={(event) => {
                  updateBirthDateParts({
                    day: event.target.value,
                    month: birthDateParts.month,
                    year: birthDateParts.year,
                  });
                }}
              >
                <option value="">DD</option>
                {Array.from({ length: 31 }, (_, index) => {
                  const value = String(index + 1).padStart(2, "0");
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  );
                })}
              </Select>
              <Select
                value={birthDateParts.month}
                onChange={(event) => {
                  updateBirthDateParts({
                    day: birthDateParts.day,
                    month: event.target.value,
                    year: birthDateParts.year,
                  });
                }}
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, index) => {
                  const value = String(index + 1).padStart(2, "0");
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  );
                })}
              </Select>
              <Select
                value={birthDateParts.year}
                onChange={(event) => {
                  updateBirthDateParts({
                    day: birthDateParts.day,
                    month: birthDateParts.month,
                    year: event.target.value,
                  });
                }}
              >
                <option value="">YYYY</option>
                {Array.from({ length: 71 }, (_, index) => {
                  const year = String(new Date().getFullYear() - index);
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </Select>
            </div>
          </Field>
          <Field label="Birth time" error={errors.birthTime?.message}>
            <div className="grid grid-cols-3 gap-3">
              <Select
                value={parsedBirthTime.hour}
                onChange={(event) => {
                  setValue(
                    "birthTime",
                    toTwentyFourHour({
                      hour: event.target.value,
                      minute: parsedBirthTime.minute,
                      meridiem: parsedBirthTime.meridiem,
                    }),
                    { shouldDirty: true, shouldValidate: true }
                  );
                }}
              >
                {Array.from({ length: 12 }, (_, index) => {
                  const value = String(index + 1).padStart(2, "0");
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  );
                })}
              </Select>
              <Select
                value={parsedBirthTime.minute}
                onChange={(event) => {
                  setValue(
                    "birthTime",
                    toTwentyFourHour({
                      hour: parsedBirthTime.hour,
                      minute: event.target.value,
                      meridiem: parsedBirthTime.meridiem,
                    }),
                    { shouldDirty: true, shouldValidate: true }
                  );
                }}
              >
                {Array.from({ length: 60 }, (_, index) => {
                  const value = String(index).padStart(2, "0");
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  );
                })}
              </Select>
              <Select
                value={parsedBirthTime.meridiem}
                onChange={(event) => {
                  setValue(
                    "birthTime",
                    toTwentyFourHour({
                      hour: parsedBirthTime.hour,
                      minute: parsedBirthTime.minute,
                      meridiem: event.target.value as "AM" | "PM",
                    }),
                    { shouldDirty: true, shouldValidate: true }
                  );
                }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </Select>
            </div>
          </Field>
          <Field label="Birth place" error={errors.birthPlace?.message}>
            <Input placeholder="City/Town, State" {...register("birthPlace")} />
          </Field>
          <Field label="Height" error={errors.height?.message}>
            <Input placeholder="e.g. 5.9 ft or 175 cm" {...register("height")} />
          </Field>
          <Field label="Weight" error={errors.weight?.message}>
            <Input placeholder="e.g. 70 kg" {...register("weight")} />
          </Field>
          <Field label="Caste" error={errors.caste?.message}>
            <Input {...register("caste")} />
          </Field>
          <Field label="Languages" error={errors.languages?.message}>
            <Input placeholder="English, Hindi, Bengali" {...register("languages")} />
          </Field>
          <Field label="Education" error={errors.education?.message}>
            <Input {...register("education")} />
          </Field>
          <Field label="Working currently?" error={errors.working?.message} asLabel={false}>
            <RadioGroup name="working" value={isWorking} options={radioOptions.yesNo} register={register} setValue={setValue} />
          </Field>
          <Field label="Profession" error={isWorking === "yes" ? errors.profession?.message : undefined}>
            <Input {...register("profession")} disabled={isWorking !== "yes"} />
          </Field>
          <Field label="Job location" error={isWorking === "yes" ? errors.jobLocation?.message : undefined}>
            <Input {...register("jobLocation")} disabled={isWorking !== "yes"} />
          </Field>
          <Field label="Salary" error={isWorking === "yes" ? errors.salary?.message : undefined}>
            <Input placeholder="Annual package or range" {...register("salary")} disabled={isWorking !== "yes"} />
          </Field>
          <Field label="Rounds chanted daily" error={errors.rounds?.message}>
            <Input {...register("rounds")} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Regulative principles followed" error={errors.regs?.message}>
              <div className="grid gap-3 md:grid-cols-2">
                {REGULATIVE_PRINCIPLES.map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/70 px-4 py-3"
                  >
                    <input type="checkbox" value={item.value} {...register("regs")} />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <Field label="Widow / widower" error={errors.widow?.message} asLabel={false}>
            <RadioGroup name="widow" value={watch("widow")} options={radioOptions.yesNo} register={register} setValue={setValue} />
          </Field>
          <Field label="Divorced" error={errors.divorced?.message} asLabel={false}>
            <RadioGroup name="divorced" value={watch("divorced")} options={radioOptions.yesNo} register={register} setValue={setValue} />
          </Field>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <h2 className="mb-6 text-2xl font-semibold">Contact and location</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Phone number" error={errors.phone?.message}>
            <Input {...register("phone")} />
          </Field>
          <Field label="Family phone number" error={errors.familyPhone?.message}>
            <Input {...register("familyPhone")} />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <Input {...register("city")} />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <Input {...register("state")} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Current address" error={errors.address?.message}>
              <Textarea rows={3} {...register("address")} />
            </Field>
          </div>
          <Field label="Open to relocation?" error={errors.relocate?.message} asLabel={false}>
            <RadioGroup name="relocate" value={watch("relocate")} options={radioOptions.yesNo} register={register} setValue={setValue} />
          </Field>
          <Field label="Counsellor name" error={errors.counsellor?.message}>
            <Input {...register("counsellor")} />
          </Field>
          <Field label="Counsellor phone number" error={errors.counsellorPhone?.message}>
            <Input {...register("counsellorPhone")} />
          </Field>
          <div className="md:col-span-2">
            <div className="mb-3 flex flex-col gap-3 rounded-2xl bg-[#fff8ef] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Original home address</p>
                <p className="text-sm text-[var(--muted)]">Use your present address if they are the same.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValue("homeAddress", currentAddress.trim(), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                Same as current
              </Button>
            </div>
            <Field label="Original home address" error={errors.homeAddress?.message}>
              <Textarea rows={3} {...register("homeAddress")} />
            </Field>
          </div>
          <Field label="Home category" error={errors.homeCategory?.message} asLabel={false}>
            <RadioGroup
              name="homeCategory"
              value={watch("homeCategory")}
              options={radioOptions.homeCategory}
              register={register}
              setValue={setValue}
            />
          </Field>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <h2 className="mb-6 text-2xl font-semibold">Family details</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Number of family members" error={errors.familyMembers?.message}>
            <Input {...register("familyMembers")} />
          </Field>
          <Field label="Father's name" error={errors.father?.message}>
            <Input {...register("father")} />
          </Field>
          <Field label="Mother's name" error={errors.mother?.message}>
            <Input {...register("mother")} />
          </Field>
          <Field label="Sibling name(s)" error={errors.sibling?.message}>
            <Input {...register("sibling")} />
          </Field>
          <Field label="Are parents chanting?" error={errors.parentsChanting?.message} asLabel={false}>
            <RadioGroup
              name="parentsChanting"
              value={watch("parentsChanting")}
              options={radioOptions.parents}
              register={register}
              setValue={setValue}
            />
          </Field>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <h2 className="mb-6 text-2xl font-semibold">About you and expectations</h2>
        <div className="space-y-5">
          <Field label="Describe yourself briefly" error={errors.aboutYou?.message}>
            <Textarea rows={8} maxLength={1000} {...register("aboutYou")} />
          </Field>
          <Field label="What do you expect from your life partner?" error={errors.expectations?.message}>
            <Textarea rows={8} maxLength={1000} {...register("expectations")} />
          </Field>
        </div>
      </motion.section>

      <div className="glass-panel flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="font-semibold">Save progress or submit fully</p>
          <p className="text-sm text-[var(--muted)]">
            Draft saves support progressive completion. Final submit marks the profile ready for admin review.
          </p>
          {submitMessage ? (
            <p
              className={`inline-flex items-center gap-2 text-sm ${
                submitMessageType === "error" ? "text-[var(--danger)]" : "text-[var(--success)]"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {submitMessage}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={handleDraftSave} disabled={isDraftPending}>
            {isDraftPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save draft
          </Button>
          <Button type="submit" disabled={isSubmitPending}>
            {isSubmitPending ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="mr-2 h-4 w-4" />
            )}
            Submit profile
          </Button>
        </div>
      </div>

      {showSuccessPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(46,36,23,0.35)] px-4">
          <div className="glass-panel w-full max-w-md rounded-[2rem] p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success)] text-white">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-semibold">Profile submitted successfully</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Your details have been saved and marked ready for admin review.
            </p>
            <div className="mt-6 flex justify-center">
              <Button type="button" onClick={() => setShowSuccessPopup(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {draftPopupOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(46,36,23,0.35)] px-4">
          <div className="glass-panel w-full max-w-md rounded-[2rem] p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-semibold">Draft saved successfully</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Your progress has been saved, and you can come back later to complete the profile.
            </p>
            <div className="mt-6 flex justify-center">
              <Button type="button" onClick={() => setDraftPopupOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
