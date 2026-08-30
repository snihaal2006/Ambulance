import re

with open("Ambulance_App/lib/screens/screen_5_arrived_incident.dart", "r", encoding="utf-8") as f:
    content = f.read()

old_block = """                    const SizedBox(height: 2),
                    Text(
                      c?.address ?? 'GST Road, Guindy Junction, Chennai',
                      style: AppTheme.plusJakartaStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textSlate200,
                      ),
                    ),
                  ],
                ),
              ),"""

new_block = """                    const SizedBox(height: 2),
                    Text(
                      c?.address ?? 'GST Road, Guindy Junction, Chennai',
                      style: AppTheme.plusJakartaStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textSlate200,
                      ),
                    ),
                    const Divider(height: 14, color: Color(0xFF334155)),
                    Text(
                      'REPORTED CONDITION',
                      style: AppTheme.monoStyle(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textSubtle,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      c?.complaint ?? 'No condition reported',
                      style: AppTheme.plusJakartaStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w800,
                        color: AppColors.amberWarning,
                      ),
                    ),
                  ],
                ),
              ),"""

content = content.replace(old_block, new_block)

with open("Ambulance_App/lib/screens/screen_5_arrived_incident.dart", "w", encoding="utf-8") as f:
    f.write(content)

with open("c:/Users/Nihaal S/java/Pulse_Route/lib/screens/screen_5_arrived_incident.dart", "w", encoding="utf-8") as f:
    f.write(content)
