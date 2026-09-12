import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import AddIconBlue from '../assets/icons/add-icon-blue.svg';
import EditIcon from '../assets/icons/edit-icon.svg';
import DeleteIcon from '../assets/icons/delete-icon.svg';

type Patient = {
  id: string;
  name: string;
  phone: string;
  age: string;
  gender: string;
};

type Props = {
  patients: Patient[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showRadio?: boolean;
  onAddMember?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  ownPatientId?: string;
};

export default function PatientSelector({ patients, selectedId, onSelect, showRadio = true, onAddMember, onEdit, onDelete, ownPatientId }: Props) {
  return (
    <>
      <View style={styles.container}>
        {patients.map((p, index) => (
          <View key={p.id}>
            <TouchableOpacity
              style={styles.patientCard}
              onPress={() => onSelect?.(p.id)}
              activeOpacity={showRadio ? 0.8 : 1}>
              {showRadio && (
                <View style={[styles.radio, selectedId === p.id && styles.radioActive]}>
                  {selectedId === p.id && <View style={styles.radioDot} />}
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text allowFontScaling={false} style={styles.patientName}>{p.name}</Text>
                <View style={styles.patientMeta}>
                  <Text allowFontScaling={false} style={styles.metaText}>{p.phone}</Text>
                  <Text allowFontScaling={false} style={styles.metaDot}>|</Text>
                  <Text allowFontScaling={false} style={styles.metaText}>Age: {p.age}</Text>
                  <Text allowFontScaling={false} style={styles.metaDot}>|</Text>
                  <Text allowFontScaling={false} style={styles.metaText}>Gender: {p.gender}</Text>
                </View>
              </View>
              {onEdit && (
                <TouchableOpacity onPress={() => onEdit(p.id)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <EditIcon width={SIZE(18)} height={SIZE(18)} />
                </TouchableOpacity>
              )}
              {onDelete && p.id !== ownPatientId && (
                <TouchableOpacity onPress={() => onDelete(p.id)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <DeleteIcon width={SIZE(18)} height={SIZE(18)} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            {index < patients.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
      {onAddMember && (
        <TouchableOpacity style={styles.addMemberBtn} activeOpacity={0.7} onPress={onAddMember}>
          <AddIconBlue width={SIZE(18)} height={SIZE(18)} />
          <Text allowFontScaling={false} style={styles.addMemberText}>Add new member</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.cardBorderLight,
    overflow: 'hidden',
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(12),
    padding: SIZE(14),
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: SIZE(14),
  },
  patientName: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(15),
    color: colors.textPrimary,
    marginTop: SIZE(-2),
  },
  radio: {
    width: SIZE(20),
    height: SIZE(20),
    borderRadius: SIZE(10),
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: {
    width: SIZE(10),
    height: SIZE(10),
    borderRadius: SIZE(5),
    backgroundColor: colors.primary,
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZE(6),
  },
  metaText: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(12),
    color: colors.textSecondary,
  },
  metaDot: {
    fontFamily: 'Manrope-Regular',
    fontSize: SIZE(14),
    color: colors.cardBorder,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SIZE(8),
    paddingVertical: SIZE(10),
    paddingHorizontal: SIZE(13),
    borderRadius: SIZE(12),
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  addMemberText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: SIZE(14),
    color: colors.primaryAccent,
  },
});
