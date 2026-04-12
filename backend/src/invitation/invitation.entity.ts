import { Account } from "src/account/account.entity";
import { Project } from "src/project/project.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum InvitationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
}

@Entity('invitations')
export class ProjectInvitation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Project, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @ManyToOne(() => Account, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invitee_id' })
    invitee: Account;

    @ManyToOne(() => Account, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'inviter_id' })
    inviter: Account;

    @Column({ type: 'int', name: 'assigned_hours', nullable: true })
    assigned_hours?: number;

    @Column({ type: 'enum', enum: InvitationStatus, default: InvitationStatus.PENDING })
    status: InvitationStatus;

    @CreateDateColumn()
    created_at: Date;
}