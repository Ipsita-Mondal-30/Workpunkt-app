import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { StudentFormSheet } from "@/components/counsellor/student-form-sheet";
import { GradientButton } from "@/components/shared/gradient-button";
import { ResourceScreen } from "@/components/shared/resource-screen";
import type { CareerPathingBundle, CareerPathingPortalStudent } from "@/lib/counsellor/types";
import { queryKeys } from "@/lib/query/keys";

function StudentRow({
  student,
  onPress,
}: {
  student: CareerPathingPortalStudent;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl border border-border bg-surface px-4 py-4"
    >
      <Text className="text-base font-semibold text-text">{student.name}</Text>
      <Text className="mt-1 text-sm text-muted">
        {student.gradeLabel} · {student.stream}
      </Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        <Text className="text-xs font-semibold uppercase text-brand-mid">
          {student.eligibilityLabel}
        </Text>
        {!student.profileEditable ? (
          <Text className="text-xs text-muted">Profile locked</Text>
        ) : (
          <Text className="text-xs text-brand-mid">Tap to edit →</Text>
        )}
      </View>
    </Pressable>
  );
}

function CareerPathingRoster({ bundle }: { bundle: CareerPathingBundle }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<CareerPathingPortalStudent | null>(null);

  return (
    <>
      <View className="mb-4 flex-row items-center justify-between gap-3">
        <Text className="text-sm text-muted">
          {bundle.students.length} students · {bundle.quota.remaining} slots left
        </Text>
        <GradientButton
          text="Add student"
          className="flex-none px-4"
          onPress={() => {
            setEditStudent(null);
            setSheetOpen(true);
          }}
        />
      </View>

      {bundle.quota.atLimit ? (
        <View className="mb-4 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3">
          <Text className="text-sm text-text">
            Student quota reached. Add a top-up from the Quota screen if needed.
          </Text>
        </View>
      ) : null}

      {bundle.students.length === 0 ? (
        <View className="rounded-2xl border border-border bg-surface px-4 py-6">
          <Text className="text-sm text-muted">
            No Career Pathing students yet. Add your first student to get started.
          </Text>
        </View>
      ) : (
        <View className="gap-2">
          {bundle.students.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              onPress={() => {
                setEditStudent(student);
                setSheetOpen(true);
              }}
            />
          ))}
        </View>
      )}

      <StudentFormSheet
        visible={sheetOpen}
        mode={editStudent ? "edit" : "create"}
        initialName={editStudent?.name}
        schoolStudentId={editStudent?.schoolStudentId}
        onClose={() => {
          setSheetOpen(false);
          setEditStudent(null);
        }}
        onSaved={() => {
          setEditStudent(null);
        }}
      />
    </>
  );
}

export default function CounsellorCareerPathingScreen() {
  return (
    <ResourceScreen<CareerPathingBundle | { ok: false; error: string }>
      title="Career Pathing"
      subtitle="Manage your school roster and eligibility"
      queryKey={queryKeys.agentCareerPathing()}
      path="/api/agent/career-pathing"
      staleTime={30_000}
    >
      {(data, { refetch }) => {
        if (data.ok === false) {
          return (
            <CareerPathingGate planActive={false} error={data.error}>
              {null}
            </CareerPathingGate>
          );
        }

        return (
          <CareerPathingGate planActive={data.planActive} error={null}>
            <CareerPathingRoster bundle={data} />
            <Pressable onPress={refetch} className="mt-4">
              <Text className="text-center text-xs text-brand-mid">Refresh roster</Text>
            </Pressable>
          </CareerPathingGate>
        );
      }}
    </ResourceScreen>
  );
}
