import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import colors from '../themes/colors';
import { SIZE } from '../themes/sizes';
import FilterIcon from '../assets/icons/filter-black-icon.svg';
import CloseIcon from '../assets/icons/close-icon.svg';

const FILTER_SECTIONS = [
  { key: 'specialties', label: 'Specialties' },
  { key: 'availability', label: 'Availability' },
  { key: 'type', label: 'Type of Practices' },
];

const FILTER_OPTIONS: Record<string, string[]> = {
  specialties: ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Ayurveda', 'Homeopathy'],
  availability: ['Live', 'Booking Opened'],
  type: ['Clinic', 'Hospital', 'Ayurveda', 'Homeopathy', 'Dental', 'Diagnostic'],
};

const EMPTY = { specialties: [], availability: [], type: [] } as Record<string, string[]>;

type Props = {
  applied: Record<string, string[]>;
  onApply: (opts: Record<string, string[]>) => void;
  /** Only render chips (no filter button). Use alongside a separate FilterModal with triggerOnly */
  chipsOnly?: boolean;
  /** Only render the filter button (no chips). Modal still works. */
  triggerOnly?: boolean;
};

export default function FilterModal({ applied, onApply, chipsOnly, triggerOnly }: Props) {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('specialties');
  const [selected, setSelected] = useState<Record<string, string[]>>(EMPTY);

  const open = () => { setSelected(applied); setVisible(true); };
  const close = () => setVisible(false);
  const apply = () => { onApply(selected); close(); };
  const clear = () => setSelected({ ...EMPTY });

  const removeApplied = (section: string, opt: string) => {
    onApply({ ...applied, [section]: applied[section].filter(o => o !== opt) });
  };

  const toggle = (opt: string) =>
    setSelected(prev => ({
      ...prev,
      [activeSection]: prev[activeSection].includes(opt)
        ? prev[activeSection].filter(o => o !== opt)
        : [...prev[activeSection], opt],
    }));

  const allApplied = Object.entries(applied).flatMap(([section, opts]) => opts.map(opt => ({ section, opt })));

  const modal = (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <Text allowFontScaling={false} style={styles.title}>Filter</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={close} activeOpacity={0.7}>
              <CloseIcon width={SIZE(20)} height={SIZE(20)} />
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.body}>
            <View style={styles.left}>
              {FILTER_SECTIONS.map((s, i) => (
                <React.Fragment key={s.key}>
                  <TouchableOpacity
                    style={[styles.tab, activeSection === s.key && styles.tabActive]}
                    activeOpacity={0.7}
                    onPress={() => setActiveSection(s.key)}
                  >
                    <Text allowFontScaling={false} style={[styles.tabText, activeSection === s.key && styles.tabTextActive]}>
                      {s.label}
                    </Text>
                    {selected[s.key].length > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{selected[s.key].length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {/* {i < FILTER_SECTIONS.length - 1 && <View style={styles.divider} />} */}
                </React.Fragment>
              ))}
            </View>
            <View style={styles.verticalDivider} />
            <ScrollView style={styles.right} showsVerticalScrollIndicator={false}>
              {FILTER_OPTIONS[activeSection].map((opt, i) => {
                const isSelected = selected[activeSection].includes(opt);
                return (
                  <React.Fragment key={opt}>
                    <TouchableOpacity style={styles.option} activeOpacity={0.7} onPress={() => toggle(opt)}>
                      <Text allowFontScaling={false} style={[styles.optionText, isSelected && styles.optionTextActive]}>{opt}</Text>
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                    {i < FILTER_OPTIONS[activeSection].length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                );
              })}
            </ScrollView>
          </View>
          <View style={styles.divider} />
          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearBtn} activeOpacity={0.7} onPress={clear}>
              <Text allowFontScaling={false} style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} activeOpacity={0.7} onPress={apply}>
              <Text allowFontScaling={false} style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (triggerOnly) {
    return (
      <>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7} onPress={open}>
          <FilterIcon width={SIZE(12)} height={SIZE(12)} />
          <Text allowFontScaling={false} style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
        {modal}
      </>
    );
  }

  if (chipsOnly) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {allApplied.map(({ section, opt }) => (
          <TouchableOpacity key={`${section}-${opt}`} style={styles.chip} activeOpacity={0.7} onPress={() => removeApplied(section, opt)}>
            <Text allowFontScaling={false} style={styles.chipText}>{opt}</Text>
            <Text style={styles.chipClose}>✕</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <>
      <View style={styles.row}>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7} onPress={open}>
          <FilterIcon width={SIZE(12)} height={SIZE(12)} />
          <Text allowFontScaling={false} style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {allApplied.map(({ section, opt }) => (
            <TouchableOpacity key={`${section}-${opt}`} style={styles.chip} activeOpacity={0.7} onPress={() => removeApplied(section, opt)}>
              <Text allowFontScaling={false} style={styles.chipText}>{opt}</Text>
              <Text style={styles.chipClose}>✕</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {modal}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SIZE(8) },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SIZE(6),
    backgroundColor: '#F5F5F5', paddingHorizontal: SIZE(8), paddingVertical: SIZE(8), borderRadius: 46,
  },
  filterText: { fontFamily: 'Manrope-Medium', fontSize: SIZE(12), color: '#00001D' },
  chipsRow: { flexDirection: 'row', gap: SIZE(8), alignItems: 'center' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: SIZE(6),
    backgroundColor: colors.primaryLight, paddingHorizontal: SIZE(10), paddingVertical: SIZE(6), borderRadius: SIZE(46),
  },
  chipText: { fontFamily: 'Manrope-Medium', fontSize: SIZE(12), color: colors.primary },
  chipClose: { fontSize: SIZE(10), color: colors.primary },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  sheet: { width: '95%', height: '90%', backgroundColor: colors.white, borderRadius: SIZE(20), padding: SIZE(20) },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SIZE(16) },
  title: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(18), color: colors.textPrimary },
  closeBtn: { padding: SIZE(6), borderRadius: SIZE(16), backgroundColor: '#F2F4F7B2', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: -SIZE(20) },
  body: { flex: 1, flexDirection: 'row', marginHorizontal: -SIZE(20) },
  left: { width: '40%' },
  verticalDivider: { width: 1, backgroundColor: colors.border },
  right: { flex: 1, paddingHorizontal: SIZE(14), paddingTop: SIZE(4) },
  tab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SIZE(14), paddingHorizontal: SIZE(14) },
  tabActive: { backgroundColor: '#F3F8FF', borderLeftWidth: SIZE(2), borderLeftColor: colors.primary },
  tabText: { fontFamily: 'Manrope-Regular', fontSize: SIZE(13), color: colors.subText, flex: 1 },
  tabTextActive: { fontFamily: 'Manrope-SemiBold', color: colors.primary },
  badge: { backgroundColor: colors.primary, borderRadius: SIZE(10), minWidth: SIZE(18), height: SIZE(18), alignItems: 'center', justifyContent: 'center', paddingHorizontal: SIZE(4) },
  badgeText: { color: colors.white, fontSize: SIZE(10), fontFamily: 'Manrope-SemiBold' },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SIZE(14) },
  optionText: { fontFamily: 'Manrope-Regular', fontSize: SIZE(13), color: colors.subText, flex: 1 },
  optionTextActive: { fontFamily: 'Manrope-SemiBold', color: colors.textPrimary },
  checkbox: { width: SIZE(18), height: SIZE(18), borderRadius: SIZE(4), borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: colors.white, fontSize: SIZE(11), lineHeight: SIZE(13) },
  footer: { flexDirection: 'row', gap: SIZE(12), paddingTop: SIZE(14) },
  clearBtn: { width: '38%', paddingVertical: SIZE(12), borderRadius: SIZE(10), borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  clearText: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(14), color: colors.textPrimary },
  applyBtn: { width: '58%', paddingVertical: SIZE(12), borderRadius: SIZE(10), backgroundColor: colors.primary, alignItems: 'center' },
  applyText: { fontFamily: 'Manrope-SemiBold', fontSize: SIZE(14), color: colors.white },
});
